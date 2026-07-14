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
    mobileControls: document.querySelectorAll('[data-move]'),
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
    { row: 7, type: 'vehicle', kind: 'taxi', label: 'TAXI', color: '#facc15', speed: 2.4, size: 1.1, gaps: [0, 4, 8] },
    { row: 7, type: 'vehicle', kind: 'motorcycle', label: 'MOTO', color: '#38bdf8', speed: 3.3, size: 0.62, gaps: [2, 6] },
    { row: 6, type: 'vehicle', kind: 'truck', label: 'CAMIÓN', color: '#ef4444', speed: -2.55, size: 1.7, gaps: [1, 6] },
    { row: 6, type: 'predator', kind: 'snake', label: 'SERPIENTE', color: '#84cc16', speed: -3.15, size: 0.92, gaps: [4, 9] },
    { row: 5, type: 'vehicle', kind: 'van', label: 'FURGÓN', color: '#f97316', speed: 2.95, size: 1.35, gaps: [0, 5] },
    { row: 5, type: 'vehicle', kind: 'pickup', label: 'PICKUP', color: '#a78bfa', speed: 3.45, size: 1.05, gaps: [3, 8] },
    { row: 4, type: 'predator', kind: 'heron', label: 'GARZA', color: '#e5e7eb', speed: -2.25, size: 0.92, gaps: [0, 4, 8] },
    { row: 3, type: 'log', kind: 'log', color: '#a16207', speed: -2, size: 1.9, gaps: [0, 5] },
    { row: 3, type: 'predator', kind: 'otter', label: 'NUTRIA', color: '#78350f', speed: -2.75, size: 0.88, gaps: [3, 8] },
    { row: 2, type: 'log', kind: 'log', color: '#92400e', speed: 2.5, size: 1.6, gaps: [2, 7] },
    { row: 2, type: 'predator', kind: 'fish', label: 'PEZ', color: '#fb7185', speed: 3.05, size: 0.82, gaps: [0, 5] },
    { row: 1, type: 'log', kind: 'log', color: '#b45309', speed: -3, size: 2.1, gaps: [1, 6] },
    { row: 1, type: 'predator', kind: 'owl', label: 'BÚHO', color: '#c084fc', speed: -3.35, size: 0.78, gaps: [4, 9] },
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
      width: tile * lane.size * (lane.type === 'vehicle' ? d.traffic : 1),
      height: lane.type === 'log' ? 44 : lane.type === 'predator' ? 38 : 42,
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
    ['#166534', '#1d4ed8', '#1d4ed8', '#1d4ed8', '#365314', '#374151', '#374151', '#374151', '#166534', '#14532d'].forEach((color, row) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, row * tile, canvas.width, tile);
      ctx.fillStyle = row === 5 || row === 6 || row === 7 ? 'rgba(15,23,42,.28)' : 'rgba(255,255,255,.04)';
      for (let x = row % 2 ? 0 : 36; x < canvas.width; x += tile) ctx.fillRect(x, row * tile + 8, 34, 4);
    });
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let x = 0; x < canvas.width; x += tile) ctx.fillRect(x + 34, tile * 5, 4, tile * 3);
    ctx.fillStyle = 'rgba(236,253,245,.18)';
    for (let x = 0; x < canvas.width; x += tile) {
      ctx.fillRect(x + 10, tile * 4 + 12, 24, 8);
      ctx.fillStyle = 'rgba(132,204,22,.65)';
      ctx.beginPath();
      ctx.arc(x + 60, tile * 4 + 17, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(236,253,245,.18)';
    }
    goalColumns.forEach((col) => {
      const occupied = state?.goals?.has(col);
      const x = col * tile + 10;
      ctx.fillStyle = occupied ? '#4ade80' : '#bbf7d0';
      roundRect(x, 10, 52, 52, 18);
      ctx.fill();
      ctx.fillStyle = occupied ? '#052e16' : '#14532d';
      ctx.beginPath();
      ctx.ellipse(x + 26, 42, 19, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = occupied ? '#dcfce7' : '#f97316';
      ctx.font = '700 22px system-ui';
      ctx.fillText(occupied ? '✓' : '●', x + 24, 35);
    });
  };

  const drawObstacle = (obstacle) => {
    ctx.fillStyle = obstacle.color;
    roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.type === 'predator' ? 20 : 12);
    ctx.fill();
    ctx.fillStyle = obstacle.type === 'log' ? 'rgba(255,255,255,.22)' : '#111827';
    if (obstacle.type === 'vehicle') {
      ctx.fillRect(obstacle.x + 10, obstacle.y + 7, Math.min(24, obstacle.width / 3), 10);
      ctx.fillRect(obstacle.x + obstacle.width - 34, obstacle.y + 7, 24, 10);
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(obstacle.x + 16, obstacle.y + obstacle.height + 2, 6, 0, Math.PI * 2);
      ctx.arc(obstacle.x + obstacle.width - 16, obstacle.y + obstacle.height + 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = '700 10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(obstacle.label, obstacle.x + obstacle.width / 2, obstacle.y + 29);
      ctx.textAlign = 'start';
    } else if (obstacle.type === 'predator') {
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(obstacle.x + obstacle.width * 0.72, obstacle.y + 12, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.font = '700 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(obstacle.kind === 'snake' ? '🐍' : obstacle.kind === 'heron' ? '🪽' : obstacle.kind === 'otter' ? '🦦' : obstacle.kind === 'fish' ? '🐟' : '🦉', obstacle.x + obstacle.width / 2, obstacle.y + 26);
      ctx.textAlign = 'start';
    } else {
      ctx.fillRect(obstacle.x + 16, obstacle.y + 8, obstacle.width - 32, 5);
      ctx.fillRect(obstacle.x + 28, obstacle.y + 25, obstacle.width - 56, 4);
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
    ctx.beginPath();
    ctx.ellipse(x + size / 2, y + size / 2 + 2, size / 2, size / 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(x + 9, y + 7, 8, 0, Math.PI * 2);
    ctx.arc(x + 27, y + 7, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.arc(x + 9, y + 7, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 27, y + 7, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 28);
    ctx.lineTo(x - 3, y + 35);
    ctx.moveTo(x + 32, y + 28);
    ctx.lineTo(x + 39, y + 35);
    ctx.stroke();
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
        if (o.type === 'vehicle') loseLife(`¡Te atropelló un/a ${o.label.toLowerCase()}!`);
        if (o.type === 'predator') loseLife(`¡Un depredador natural (${o.label.toLowerCase()}) atrapó a la rana!`);
        if (o.type === 'log') {
          onLog = true;
          state.frog.x += o.speed * delta;
          state.frog.col = Math.round((state.frog.x - 18) / tile);
        }
      }
    });
    if ([1, 2, 3].includes(state.frog.row) && !onLog) loseLife('Caíste al arroyo. Busca troncos.');
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
  ui.mobileControls.forEach((button) => button.addEventListener('click', () => {
    const [dx, dy] = button.dataset.move.split(',').map(Number);
    moveFrog(dx, dy);
  }));
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
