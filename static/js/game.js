(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const ui = {
    start: document.querySelector('#startButton'),
    difficulty: document.querySelector('#difficulty'),
    level: document.querySelector('#level'),
    score: document.querySelector('#score'),
    lives: document.querySelector('#lives'),
    best: document.querySelector('#bestScore'),
    time: document.querySelector('#timeLeft'),
    streak: document.querySelector('#streak'),
    message: document.querySelector('#message'),
  };

  const tile = 72;
  const rows = 10;
  const cols = 10;
  const keys = {
    ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
    ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
  };
  const difficultyMap = {
    easy: { speed: 0.75, lives: 5, traffic: 0.82, time: 55, bonus: 1 },
    medium: { speed: 1, lives: 3, traffic: 1, time: 45, bonus: 1.2 },
    hard: { speed: 1.35, lives: 3, traffic: 1.25, time: 38, bonus: 1.5 },
  };
  const lanes = [
    { row: 7, type: 'car', color: '#f97316', speed: 2.4, size: 1.15, gaps: [0, 4, 8] },
    { row: 6, type: 'car', color: '#ef4444', speed: -3.1, size: 1, gaps: [1, 5, 9] },
    { row: 5, type: 'car', color: '#facc15', speed: 3.7, size: 0.9, gaps: [0, 3, 7] },
    { row: 3, type: 'log', color: '#a16207', speed: -2, size: 1.9, gaps: [0, 5] },
    { row: 2, type: 'log', color: '#92400e', speed: 2.5, size: 1.6, gaps: [2, 7] },
    { row: 1, type: 'log', color: '#b45309', speed: -3, size: 2.1, gaps: [1, 6] },
  ];
  const goalColumns = [1, 3, 5, 7, 9];
  let state;
  let animationFrame;
  let touchStart = null;

  const difficulty = () => difficultyMap[ui.difficulty.value];
  const randomColumn = () => Math.floor(Math.random() * cols);
  const safeX = (col) => col * tile + 18;
  const safeY = (row) => row * tile + 18;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const roundRect = (x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  };

  const spawnBonus = () => {
    const options = [{ row: 4, type: 'fly' }, { row: 8, type: 'clock' }];
    const selected = options[Math.floor(Math.random() * options.length)];
    return { ...selected, col: randomColumn(), ttl: 9, collected: false };
  };

  const buildObstacles = (level) => {
    const d = difficulty();
    const boost = 1 + Math.min(level - 1, 12) * 0.055;
    return lanes.flatMap((lane) => lane.gaps.map((gap, index) => ({
      ...lane,
      x: (gap * tile + index * 18) % (canvas.width + tile),
      y: lane.row * tile + 14,
      width: tile * lane.size * (lane.type === 'car' ? d.traffic : 1),
      height: lane.type === 'car' ? 42 : 44,
      speed: lane.speed * d.speed * boost,
    })));
  };

  const resetFrog = () => {
    state.frog = { col: 4, row: 8, x: safeX(4), y: safeY(8), size: 36, shield: 0 };
  };

  const freshState = () => {
    const d = difficulty();
    const next = {
      running: true,
      level: 1,
      score: 0,
      lives: d.lives,
      best: Number(localStorage.getItem('froggerBest') || 0),
      timeLeft: d.time,
      streak: 0,
      frog: {},
      goals: new Set(),
      obstacles: [],
      bonus: spawnBonus(),
      particles: [],
      lastTime: 0,
      status: 'Cruza hacia una meta iluminada. ¡Completa las cinco ranas!',
    };
    state = next;
    resetFrog();
    next.obstacles = buildObstacles(1);
    return next;
  };

  const addParticles = (x, y, color, amount = 12) => {
    for (let i = 0; i < amount; i += 1) {
      state.particles.push({ x, y, color, life: 28, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 });
    }
  };

  const drawBackground = () => {
    ['#166534', '#1d4ed8', '#1d4ed8', '#1d4ed8', '#166534', '#374151', '#374151', '#374151', '#166534', '#14532d'].forEach((color, row) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, row * tile, canvas.width, tile);
    });
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let x = 0; x < canvas.width; x += tile) ctx.fillRect(x + 34, tile * 5, 4, tile * 3);
    goalColumns.forEach((col) => {
      const occupied = state?.goals?.has(col);
      ctx.fillStyle = occupied ? '#4ade80' : '#bbf7d0';
      roundRect(col * tile + 10, 10, 52, 52, 18);
      ctx.fill();
      ctx.fillStyle = occupied ? '#052e16' : '#14532d';
      ctx.font = '700 24px system-ui';
      ctx.fillText(occupied ? '✓' : '●', col * tile + 27, 44);
    });
  };

  const drawObstacle = (obstacle) => {
    ctx.fillStyle = obstacle.color;
    roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 12);
    ctx.fill();
    ctx.fillStyle = obstacle.type === 'car' ? '#111827' : 'rgba(255,255,255,.22)';
    if (obstacle.type === 'car') {
      ctx.fillRect(obstacle.x + 12, obstacle.y + 6, 22, 10);
      ctx.fillRect(obstacle.x + obstacle.width - 34, obstacle.y + 6, 22, 10);
    } else {
      ctx.fillRect(obstacle.x + 16, obstacle.y + 8, obstacle.width - 32, 5);
    }
  };

  const drawBonus = () => {
    if (!state.bonus || state.bonus.collected) return;
    const x = state.bonus.col * tile + 36;
    const y = state.bonus.row * tile + 36;
    ctx.fillStyle = state.bonus.type === 'clock' ? '#93c5fd' : '#fde68a';
    ctx.beginPath();
    ctx.arc(x, y, 15 + Math.sin(Date.now() / 140) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(state.bonus.type === 'clock' ? '+T' : '+', x, y + 6);
    ctx.textAlign = 'start';
  };

  const drawFrog = () => {
    const { x, y, size, shield } = state.frog;
    if (shield > 0) {
      ctx.strokeStyle = 'rgba(147,197,253,.9)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, 27, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#4ade80';
    roundRect(x, y, size, size, 12);
    ctx.fill();
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.arc(x + 11, y + 11, 4, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 11, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawParticles = () => {
    state.particles.forEach((p) => {
      ctx.globalAlpha = Math.max(p.life / 28, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 4, 4);
      ctx.globalAlpha = 1;
    });
  };

  const overlap = (a, b) => a.x < b.x + b.width && a.x + a.size > b.x && a.y < b.y + b.height && a.y + a.size > b.y;

  const moveFrog = (dx, dy) => {
    if (!state?.running) return;
    state.frog.col = clamp(state.frog.col + dx, 0, cols - 1);
    state.frog.row = clamp(state.frog.row + dy, 0, rows - 1);
    state.frog.x = safeX(state.frog.col);
    state.frog.y = safeY(state.frog.row);
  };

  const loseLife = (reason) => {
    const resetTimer = reason.includes('tiempo');
    if (state.frog.shield > 0) {
      state.frog.shield = 0;
      state.status = `Escudo activado: ${reason}`;
      if (resetTimer) state.timeLeft = difficulty().time;
      resetFrog();
      return;
    }
    state.lives -= 1;
    state.streak = 0;
    state.status = reason;
    if (resetTimer) state.timeLeft = difficulty().time;
    addParticles(state.frog.x + 18, state.frog.y + 18, '#ef4444', 16);
    if (state.lives <= 0) {
      state.running = false;
      state.status = `Fin del juego. Puntaje final: ${state.score}.`;
    }
    resetFrog();
  };

  const completeBoard = () => {
    state.score += Math.round((350 + state.timeLeft * 6 + state.streak * 50) * difficulty().bonus);
    state.level += 1;
    state.goals.clear();
    state.timeLeft = difficulty().time + Math.min(state.level * 2, 14);
    state.obstacles = buildObstacles(state.level);
    state.bonus = spawnBonus();
    state.status = '¡Tablero completo! La ciudad acelera y el bonus sube.';
  };

  const completeGoal = () => {
    const nearestGoal = goalColumns.reduce((best, col) => (Math.abs(col - state.frog.col) < Math.abs(best - state.frog.col) ? col : best), goalColumns[0]);
    if (Math.abs(nearestGoal - state.frog.col) > 1 || state.goals.has(nearestGoal)) {
      loseLife('Esa meta no estaba libre. Apunta a una zona iluminada.');
      return;
    }
    state.goals.add(nearestGoal);
    state.streak += 1;
    state.score += Math.round((100 + state.level * 25 + state.timeLeft * 3 + state.streak * 20) * difficulty().bonus);
    addParticles(nearestGoal * tile + 36, 36, '#4ade80', 22);
    state.status = `¡Meta asegurada! Racha x${state.streak}.`;
    resetFrog();
    if (state.goals.size === goalColumns.length) completeBoard();
  };

  const collectBonus = () => {
    if (!state.bonus || state.bonus.collected || state.frog.col !== state.bonus.col || state.frog.row !== state.bonus.row) return;
    state.bonus.collected = true;
    if (state.bonus.type === 'clock') {
      state.timeLeft += 8;
      state.status = 'Reloj recogido: +8 segundos.';
    } else {
      state.score += 150;
      state.frog.shield = 1;
      state.status = 'Mosca dorada: +150 y escudo contra el próximo golpe.';
    }
    addParticles(state.frog.x + 18, state.frog.y + 18, '#fde68a', 18);
  };

  const updateParticles = () => {
    state.particles = state.particles.filter((p) => p.life > 0).map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 1 }));
  };

  const update = (delta) => {
    state.timeLeft -= delta / 60;
    if (state.timeLeft <= 0) loseLife('Se terminó el tiempo.');
    let onLog = false;
    state.obstacles.forEach((o) => {
      o.x += o.speed * delta;
      if (o.speed > 0 && o.x > canvas.width + tile) o.x = -o.width;
      if (o.speed < 0 && o.x < -o.width - tile) o.x = canvas.width + tile;
      if (overlap(state.frog, o)) {
        if (o.type === 'car') loseLife('¡Un auto te golpeó!');
        if (o.type === 'log') {
          onLog = true;
          state.frog.x += o.speed * delta;
          state.frog.col = Math.round((state.frog.x - 18) / tile);
        }
      }
    });
    if ([1, 2, 3].includes(state.frog.row) && !onLog) loseLife('Caíste al río. Busca troncos.');
    if (state.frog.x < 0 || state.frog.x + state.frog.size > canvas.width) loseLife('Te saliste del tablero.');
    collectBonus();
    if (state.bonus && !state.bonus.collected) {
      state.bonus.ttl -= delta / 60;
      if (state.bonus.ttl <= 0) state.bonus = spawnBonus();
    }
    if (state.frog.row === 0) completeGoal();
    updateParticles();
    state.best = Math.max(state.best, state.score);
    localStorage.setItem('froggerBest', String(state.best));
  };

  const draw = () => {
    drawBackground();
    state.obstacles.forEach(drawObstacle);
    drawBonus();
    drawFrog();
    drawParticles();
    ui.level.textContent = state.level;
    ui.score.textContent = state.score;
    ui.lives.textContent = state.lives;
    ui.best.textContent = state.best;
    ui.time.textContent = Math.max(0, Math.ceil(state.timeLeft));
    ui.streak.textContent = state.streak;
    ui.message.textContent = state.running ? state.status : `${state.status} Pulsa iniciar para volver a jugar.`;
  };

  const loop = (time) => {
    if (!state.lastTime) state.lastTime = time;
    const delta = Math.min((time - state.lastTime) / 16.67, 3);
    state.lastTime = time;
    if (state.running) update(delta);
    draw();
    animationFrame = requestAnimationFrame(loop);
  };

  const start = () => {
    cancelAnimationFrame(animationFrame);
    state = freshState();
    loop(0);
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') start();
    if (keys[event.key]) {
      event.preventDefault();
      moveFrog(...keys[event.key]);
    }
  });
  canvas.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0]; }, { passive: true });
  canvas.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - touchStart.clientX;
    const dy = end.clientY - touchStart.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    Math.abs(dx) > Math.abs(dy) ? moveFrog(Math.sign(dx), 0) : moveFrog(0, Math.sign(dy));
  }, { passive: true });
  ui.start.addEventListener('click', start);
  ui.difficulty.addEventListener('change', start);
  ui.best.textContent = localStorage.getItem('froggerBest') || '0';
  state = freshState();
  state.running = false;
  draw();
})();
