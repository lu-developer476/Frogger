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
    guide: document.querySelector('#guideButton'),
    guideDialog: document.querySelector('#guideDialog'),
    setupDialog: document.querySelector('#setupDialog'),
    confirmStart: document.querySelector('#confirmStart'),
    frogSpecies: document.querySelector('#frogSpecies'),
    frogPreview: document.querySelector('#frogPreview'),
    frogSpeciesInfo: document.querySelector('#frogSpeciesInfo'),
    scenario: document.querySelector('#scenario'),
    visualTheme: document.querySelector('#visualTheme'),
    visualMode: document.querySelector('#visualMode'),
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
  const frogProfiles = {
    greenTree: { name: 'Rana verde arbórea', body: '#76d66b', belly: '#ffe5a3', eye: '#f6d35b', pupil: '#111827', spot: '#3f9f45', pattern: 'soft', info: 'Verde suave, vientre crema y ojos dorados como la rana de la captura.' },
    redEye: { name: 'Rana de ojos rojos', body: '#4ade80', belly: '#fef3c7', eye: '#ef4444', pupil: '#111827', spot: '#2563eb', pattern: 'flanks', info: 'Verde intenso, ojos rojos y laterales azulados de la rana de ojos rojos.' },
    poisonDart: { name: 'Rana dardo venenosa', body: '#22d3ee', belly: '#a7f3d0', eye: '#111827', pupil: '#f8fafc', spot: '#0f172a', pattern: 'spots', info: 'Azul tropical con manchas oscuras reales de ranas dardo.' },
    tomato: { name: 'Rana tomate', body: '#f97316', belly: '#fed7aa', eye: '#7c2d12', pupil: '#111827', spot: '#c2410c', pattern: 'stripe', info: 'Naranja rojizo y vientre cálido inspirado en la rana tomate.' },
    glass: { name: 'Rana de cristal', body: 'rgba(134,239,172,.82)', belly: 'rgba(240,253,244,.72)', eye: '#d9f99d', pupil: '#14532d', spot: '#22c55e', pattern: 'translucent', info: 'Verde translúcido y vientre pálido como las ranas de cristal.' },
  };
  const scenarioPalettes = {
    city: {
      name: 'Ciudad',
      rows: ['#334155', '#475569', '#334155', '#475569', '#64748b', '#475569', '#334155', '#475569', '#22c55e', '#166534'],
      roadRows: [1, 2, 3, 5, 6, 7],
      waterRows: [],
      natureRows: [0, 4, 8, 9],
      waterStripe: 'rgba(255,255,255,.22)',
      roadStripe: 'rgba(248,250,252,.24)',
      goal: '#fde68a',
      occupied: '#f59e0b',
      message: 'Ciudad: esquivá tráfico urbano, taxis, buses y motos hasta llegar a las plazas iluminadas.',
    },
    forest: {
      name: 'Bosque',
      rows: ['#14532d', '#166534', '#15803d', '#166534', '#365314', '#3f6212', '#166534', '#15803d', '#22c55e', '#052e16'],
      roadRows: [],
      waterRows: [],
      natureRows: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      waterStripe: 'rgba(187,247,208,.2)',
      roadStripe: 'rgba(220,252,231,.16)',
      goal: '#86efac',
      occupied: '#16a34a',
      message: 'Bosque: avanzá entre depredadores naturales, ramas móviles y claros seguros.',
    },
    snow: {
      name: 'Nieve',
      rows: ['#e0f2fe', '#bae6fd', '#f8fafc', '#cbd5e1', '#e2e8f0', '#94a3b8', '#f1f5f9', '#cbd5e1', '#dbeafe', '#eff6ff'],
      roadRows: [5, 7],
      waterRows: [1, 3],
      natureRows: [2, 4, 6, 8, 9],
      waterStripe: 'rgba(255,255,255,.55)',
      roadStripe: 'rgba(15,23,42,.16)',
      goal: '#bfdbfe',
      occupied: '#60a5fa',
      message: 'Nieve: cruzá hielo quebradizo y rutas congeladas con poca visibilidad.',
    },
    desert: {
      name: 'Desierto',
      rows: ['#92400e', '#f59e0b', '#d97706', '#fbbf24', '#b45309', '#78350f', '#f59e0b', '#d97706', '#fde68a', '#92400e'],
      roadRows: [5],
      waterRows: [],
      natureRows: [1, 2, 3, 4, 6, 7, 8, 9],
      waterStripe: 'rgba(254,243,199,.22)',
      roadStripe: 'rgba(254,215,170,.24)',
      goal: '#fef3c7',
      occupied: '#f97316',
      message: 'Desierto: evitá escorpiones, buitres y tormentas de arena en un cruce seco.',
    },
    mixed: {
      name: 'Ruta, lago y bosque',
      rows: ['#166534', '#38bdf8', '#38bdf8', '#38bdf8', '#22c55e', '#57534e', '#57534e', '#57534e', '#4ade80', '#14532d'],
      roadRows: [5, 6, 7],
      waterRows: [1, 2, 3],
      natureRows: [0, 4, 8, 9],
      waterStripe: 'rgba(240,253,250,.34)',
      roadStripe: 'rgba(250,204,21,.16)',
      goal: '#86efac',
      occupied: '#16a34a',
      message: 'Ruta, lago y bosque: el desafío total combina vehículos, troncos y depredadores.',
    },
  };
  const scenarioConfig = () => scenarioPalettes[ui.scenario?.value] || scenarioPalettes.mixed;
  const visualThemes = ['quest', 'nocturne', 'sunset'];
  const visualModes = ['illustrated', 'emoji'];
  const applyVisualMode = (mode) => {
    const selected = visualModes.includes(mode) ? mode : 'illustrated';
    if (ui.visualMode) ui.visualMode.value = selected;
    localStorage.setItem('froggerVisualMode', selected);
    drawFrogPreview();
    if (state) draw();
  };
  const isEmojiMode = () => (ui.visualMode?.value || 'illustrated') === 'emoji';
  const emojiProfiles = {
    frog: '🐸',
    vehicle: { taxi: '🚕', motorcycle: '🏍️', bus: '🚌', truck: '🚚', van: '🚐', pickup: '🛻', snowplow: '🚜' },
    predator: { snake: '🐍', heron: '🪿', otter: '🦦', fish: '🐟', owl: '🦉', vulture: '🦅', scorpion: '🦂', coyote: '🐺' },
    log: { log: '🪵', branch: '🪵', ice: '🧊', tumbleweed: '🌾', cactus: '🌵', rock: '🪨', box: '📦' },
    bonus: { clock: '⏱️', fly: '🪰' },
  };
  const drawCenteredEmoji = (targetCtx, emoji, x, y, size) => {
    targetCtx.save();
    targetCtx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif`;
    targetCtx.textAlign = 'center';
    targetCtx.textBaseline = 'middle';
    targetCtx.fillText(emoji, x, y);
    targetCtx.restore();
  };
  const applyVisualTheme = (theme) => {
    const selected = visualThemes.includes(theme) ? theme : 'quest';
    document.body.dataset.theme = selected;
    if (ui.visualTheme) ui.visualTheme.value = selected;
    localStorage.setItem('froggerVisualTheme', selected);
  };

  const predatorProfiles = {
    snake: { body: '#84cc16', belly: '#ecfccb', eye: '#fefce8', pupil: '#111827', spot: '#365314', accent: '#bef264', shape: 'serpent' },
    heron: { body: '#e5e7eb', belly: '#f8fafc', eye: '#f59e0b', pupil: '#111827', spot: '#94a3b8', accent: '#f97316', shape: 'wader' },
    otter: { body: '#78350f', belly: '#d97706', eye: '#fef3c7', pupil: '#111827', spot: '#451a03', accent: '#fbbf24', shape: 'mammal' },
    fish: { body: '#38bdf8', belly: '#bfdbfe', eye: '#f8fafc', pupil: '#111827', spot: '#0e7490', accent: '#fb7185', shape: 'fish' },
    owl: { body: '#92400e', belly: '#fde68a', eye: '#fde047', pupil: '#111827', spot: '#451a03', accent: '#fef3c7', shape: 'raptor' },
    vulture: { body: '#57534e', belly: '#a8a29e', eye: '#fde047', pupil: '#111827', spot: '#292524', accent: '#ef4444', shape: 'vulture' },
    scorpion: { body: '#451a03', belly: '#92400e', eye: '#fef3c7', pupil: '#111827', spot: '#1c1917', accent: '#f59e0b', shape: 'scorpion' },
    coyote: { body: '#d97706', belly: '#fed7aa', eye: '#fef3c7', pupil: '#111827', spot: '#78350f', accent: '#fbbf24', shape: 'canid' },
  };
  const frogConfig = () => frogProfiles[ui.frogSpecies?.value] || frogProfiles.greenTree;

  const scenarioLanes = {
    city: [
      { row: 7, type: 'vehicle', kind: 'taxi', label: 'TAXI', color: '#facc15', speed: 2.7, size: 1.05, gaps: [0, 4, 8] },
      { row: 7, type: 'vehicle', kind: 'motorcycle', label: 'MOTO', color: '#38bdf8', speed: 3.5, size: 0.62, gaps: [2, 6] },
      { row: 6, type: 'vehicle', kind: 'bus', label: 'BUS', color: '#f97316', speed: -2.25, size: 1.85, gaps: [1, 6] },
      { row: 5, type: 'vehicle', kind: 'truck', label: 'CAMIÓN', color: '#ef4444', speed: 2.45, size: 1.7, gaps: [0, 5] },
      { row: 3, type: 'vehicle', kind: 'van', label: 'FURGÓN', color: '#a78bfa', speed: -2.9, size: 1.3, gaps: [2, 7] },
      { row: 2, type: 'vehicle', kind: 'pickup', label: 'PICKUP', color: '#22c55e', speed: 3.15, size: 1.08, gaps: [0, 5] },
      { row: 1, type: 'vehicle', kind: 'taxi', label: 'TAXI', color: '#fde047', speed: -3.35, size: 0.95, gaps: [3, 8] },
    ],
    forest: [
      { row: 7, type: 'predator', kind: 'snake', label: 'SERPIENTE', color: '#84cc16', speed: 2.4, size: 0.95, gaps: [0, 4, 8] },
      { row: 6, type: 'predator', kind: 'owl', label: 'BÚHO', color: '#c084fc', speed: -2.65, size: 0.82, gaps: [2, 6] },
      { row: 5, type: 'log', kind: 'branch', label: 'TRONCO', color: '#854d0e', speed: 2.05, size: 1.35, gaps: [1, 6] },
      { row: 4, type: 'predator', kind: 'heron', label: 'GARZA', color: '#e5e7eb', speed: -2.15, size: 0.9, gaps: [0, 5] },
      { row: 3, type: 'predator', kind: 'otter', label: 'NUTRIA', color: '#78350f', speed: 2.7, size: 0.88, gaps: [3, 8] },
      { row: 2, type: 'log', kind: 'branch', label: 'TRONCO', color: '#a16207', speed: -2.35, size: 1.2, gaps: [0, 5] },
      { row: 1, type: 'predator', kind: 'snake', label: 'VÍBORA', color: '#65a30d', speed: 3, size: 0.86, gaps: [2, 7] },
    ],
    snow: [
      { row: 7, type: 'vehicle', kind: 'snowplow', label: 'QUITA', color: '#f97316', speed: 2.15, size: 1.55, gaps: [0, 5] },
      { row: 5, type: 'vehicle', kind: 'truck', label: 'CAMIÓN', color: '#64748b', speed: -2.35, size: 1.65, gaps: [2, 7] },
      { row: 3, type: 'log', kind: 'ice', label: 'TÉMPANO', color: '#e0f2fe', speed: 2.25, size: 1.45, gaps: [0, 4, 8] },
      { row: 3, type: 'predator', kind: 'fish', label: 'PEZ', color: '#38bdf8', speed: 2.75, size: 0.8, gaps: [2, 7] },
      { row: 1, type: 'log', kind: 'ice', label: 'TÉMPANO', color: '#bfdbfe', speed: -2.7, size: 1.8, gaps: [1, 6] },
      { row: 1, type: 'predator', kind: 'owl', label: 'BÚHO', color: '#f8fafc', speed: -3.05, size: 0.78, gaps: [4, 9] },
    ],
    desert: [
      { row: 7, type: 'predator', kind: 'snake', label: 'SERPIENTE', color: '#a3e635', speed: 2.85, size: 0.9, gaps: [0, 5] },
      { row: 6, type: 'predator', kind: 'vulture', label: 'BUITRE', color: '#92400e', speed: -3.15, size: 0.82, gaps: [2, 7] },
      { row: 5, type: 'vehicle', kind: 'pickup', label: '4X4', color: '#f97316', speed: 2.55, size: 1.25, gaps: [1, 6] },
      { row: 4, type: 'predator', kind: 'scorpion', label: 'ESCORPIÓN', color: '#451a03', speed: -2.45, size: 0.78, gaps: [0, 4, 8] },
      { row: 3, type: 'log', kind: 'tumbleweed', label: 'MATORRAL', color: '#facc15', speed: 2.95, size: 0.85, gaps: [3, 8] },
      { row: 2, type: 'predator', kind: 'coyote', label: 'COYOTE', color: '#d97706', speed: -2.75, size: 0.88, gaps: [1, 6] },
      { row: 1, type: 'log', kind: 'cactus', label: 'CACTUS', color: '#65a30d', speed: 2.1, size: 1.15, gaps: [0, 5] },
    ],
    mixed: [
      { row: 7, type: 'vehicle', kind: 'taxi', label: 'TAXI', color: '#facc15', speed: 2.4, size: 1.1, gaps: [0, 4, 8] },
      { row: 7, type: 'vehicle', kind: 'motorcycle', label: 'MOTO', color: '#38bdf8', speed: 3.3, size: 0.62, gaps: [2, 6] },
      { row: 6, type: 'vehicle', kind: 'truck', label: 'CAMIÓN', color: '#ef4444', speed: -2.55, size: 1.7, gaps: [1, 6] },
      { row: 6, type: 'predator', kind: 'snake', label: 'SERPIENTE', color: '#84cc16', speed: -3.15, size: 0.92, gaps: [4, 9] },
      { row: 5, type: 'vehicle', kind: 'van', label: 'FURGÓN', color: '#f97316', speed: 2.95, size: 1.35, gaps: [0, 5] },
      { row: 5, type: 'vehicle', kind: 'pickup', label: 'PICKUP', color: '#a78bfa', speed: 3.45, size: 1.05, gaps: [3, 8] },
      { row: 4, type: 'predator', kind: 'heron', label: 'GARZA', color: '#e5e7eb', speed: -2.25, size: 0.92, gaps: [0, 4, 8] },
      { row: 3, type: 'log', kind: 'log', label: 'TRONCO', color: '#a16207', speed: -2, size: 1.9, gaps: [0, 5] },
      { row: 3, type: 'predator', kind: 'otter', label: 'NUTRIA', color: '#78350f', speed: -2.75, size: 0.88, gaps: [3, 8] },
      { row: 2, type: 'log', kind: 'log', label: 'TRONCO', color: '#92400e', speed: 2.5, size: 1.6, gaps: [2, 7] },
      { row: 2, type: 'predator', kind: 'fish', label: 'PEZ', color: '#fb7185', speed: 3.05, size: 0.82, gaps: [0, 5] },
      { row: 1, type: 'log', kind: 'log', label: 'TRONCO', color: '#b45309', speed: -3, size: 2.1, gaps: [1, 6] },
      { row: 1, type: 'predator', kind: 'owl', label: 'BÚHO', color: '#c084fc', speed: -3.35, size: 0.78, gaps: [4, 9] },
    ],
  };
  const lanesForScenario = () => scenarioLanes[ui.scenario?.value] || scenarioLanes.mixed;
  const isWaterLane = (row) => scenarioConfig().waterRows.includes(row);
  const isPassiveObstacle = (obstacle) => obstacle.type === 'log';

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
    return lanesForScenario().flatMap((lane) => lane.gaps.map((gap, index) => ({
      ...lane,
      x: (gap * tile + index * 18) % (canvas.width + tile),
      y: lane.row * tile + 14,
      width: tile * lane.size * (lane.type === 'vehicle' ? d.traffic : 1),
      height: lane.type === 'log' ? 44 : lane.type === 'predator' ? 38 : 42,
      speed: isPassiveObstacle(lane) && !isWaterLane(lane.row) ? 0 : lane.speed * d.speed * boost,
    })));
  };

  const resetFrog = () => {
    state.frog = { col: 4, row: 8, x: safeX(4), y: safeY(8), size: 38, shield: 0 };
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
      status: scenarioConfig().message
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
    const scenario = scenarioConfig();
    scenario.rows.forEach((color, row) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, row * tile, canvas.width, tile);
      ctx.fillStyle = scenario.roadRows.includes(row) ? scenario.roadStripe : scenario.waterStripe;
      for (let x = row % 2 ? 0 : 36; x < canvas.width; x += tile) ctx.fillRect(x, row * tile + 8, 34, 4);
    });
    scenario.roadRows.forEach((row) => {
      ctx.fillStyle = 'rgba(255,254,250,.5)';
      for (let x = 0; x < canvas.width; x += tile) ctx.fillRect(x + 34, tile * row + 31, 28, 4);
    });
    scenario.natureRows.forEach((row) => {
      if (row === 0) return;
      ctx.fillStyle = 'rgba(47,81,49,.18)';
      for (let x = 0; x < canvas.width; x += tile) {
        ctx.fillRect(x + 10, tile * row + 12, 24, 8);
        ctx.fillStyle = 'rgba(111,154,88,.78)';
        ctx.beginPath();
        ctx.arc(x + 60, tile * row + 17, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(47,81,49,.18)';
      }
    });
    goalColumns.forEach((col) => {
      const occupied = state?.goals?.has(col);
      const x = col * tile + 10;
      ctx.fillStyle = occupied ? scenario.occupied : scenario.goal;
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
    if (isEmojiMode()) {
      const emoji = emojiProfiles[obstacle.type]?.[obstacle.kind] || (obstacle.type === 'vehicle' ? '🚗' : obstacle.type === 'predator' ? '🐾' : '📦');
      const size = obstacle.type === 'vehicle' ? Math.min(46, Math.max(30, obstacle.height + 6)) : obstacle.type === 'predator' ? 38 : 40;
      const count = obstacle.type === 'vehicle' || obstacle.type === 'log' ? Math.max(1, Math.round(obstacle.width / tile)) : 1;
      for (let i = 0; i < count; i += 1) {
        const segmentX = obstacle.x + ((i + 0.5) * obstacle.width) / count;
        drawCenteredEmoji(ctx, emoji, segmentX, obstacle.y + obstacle.height / 2 + 1, size);
      }
      return;
    }
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
      renderPredator(ctx, obstacle);
      ctx.fillStyle = 'rgba(255,255,255,.88)';
      ctx.font = '700 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(obstacle.label, obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height - 2);
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
    if (isEmojiMode()) {
      drawCenteredEmoji(ctx, emojiProfiles.bonus[state.bonus.type], x, y, 32);
      return;
    }
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

  const renderPredatorEye = (targetCtx, x, y, size, profile) => {
    targetCtx.fillStyle = profile.eye;
    targetCtx.beginPath();
    targetCtx.arc(x, y, size, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = profile.pupil;
    targetCtx.beginPath();
    targetCtx.arc(x + size * 0.2, y, size * 0.45, 0, Math.PI * 2);
    targetCtx.fill();
  };

  const renderPredator = (targetCtx, obstacle) => {
    const profile = predatorProfiles[obstacle.kind] || predatorProfiles.snake;
    const { x, y, width, height, speed } = obstacle;
    const direction = speed >= 0 ? 1 : -1;
    const cx = x + width / 2;
    const cy = y + height / 2;
    targetCtx.save();
    targetCtx.translate(cx, cy);
    targetCtx.scale(direction, 1);
    targetCtx.translate(-cx, -cy);
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';

    if (profile.shape === 'serpent') {
      targetCtx.strokeStyle = profile.body;
      targetCtx.lineWidth = 16;
      targetCtx.beginPath();
      targetCtx.moveTo(x + 10, cy + 3);
      targetCtx.bezierCurveTo(x + width * 0.28, y + 2, x + width * 0.48, y + height - 2, x + width * 0.7, cy);
      targetCtx.bezierCurveTo(x + width * 0.82, y + 7, x + width - 22, y + 8, x + width - 9, cy - 2);
      targetCtx.stroke();
      targetCtx.strokeStyle = profile.spot;
      targetCtx.lineWidth = 3;
      targetCtx.beginPath();
      targetCtx.moveTo(x + 18, cy + 1);
      targetCtx.bezierCurveTo(x + width * 0.36, y + 11, x + width * 0.55, y + 27, x + width - 18, cy - 4);
      targetCtx.stroke();
      targetCtx.fillStyle = profile.accent;
      targetCtx.beginPath();
      targetCtx.moveTo(x + width - 6, cy - 2);
      targetCtx.lineTo(x + width + 8, cy - 9);
      targetCtx.lineTo(x + width + 4, cy + 2);
      targetCtx.fill();
      renderPredatorEye(targetCtx, x + width - 24, cy - 7, 3.4, profile);
    } else if (profile.shape === 'wader') {
      targetCtx.strokeStyle = profile.spot;
      targetCtx.lineWidth = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(cx + 10, y + height - 5); targetCtx.lineTo(cx + 22, y + height + 8);
      targetCtx.moveTo(cx - 2, y + height - 5); targetCtx.lineTo(cx - 13, y + height + 8);
      targetCtx.stroke();
      targetCtx.fillStyle = profile.body;
      targetCtx.beginPath(); targetCtx.ellipse(cx - 3, cy + 3, width * 0.2, height * 0.34, 0, 0, Math.PI * 2); targetCtx.fill();
      targetCtx.strokeStyle = profile.body; targetCtx.lineWidth = 9;
      targetCtx.beginPath(); targetCtx.moveTo(cx + 9, cy - 2); targetCtx.quadraticCurveTo(cx + 28, y - 3, x + width - 22, y + 8); targetCtx.stroke();
      targetCtx.fillStyle = profile.accent;
      targetCtx.beginPath(); targetCtx.moveTo(x + width - 21, y + 6); targetCtx.lineTo(x + width + 6, y + 10); targetCtx.lineTo(x + width - 20, y + 15); targetCtx.fill();
      renderPredatorEye(targetCtx, x + width - 25, y + 6, 3.2, profile);
    } else if (profile.shape === 'fish') {
      targetCtx.fillStyle = profile.body;
      targetCtx.beginPath(); targetCtx.ellipse(cx, cy, width * 0.28, height * 0.36, 0, 0, Math.PI * 2); targetCtx.fill();
      targetCtx.fillStyle = profile.accent;
      targetCtx.beginPath(); targetCtx.moveTo(x + 12, cy); targetCtx.lineTo(x - 6, y + 7); targetCtx.lineTo(x - 6, y + height - 7); targetCtx.fill();
      targetCtx.fillStyle = profile.belly; targetCtx.fillRect(cx - width * 0.09, cy + 4, width * 0.24, 4);
      renderPredatorEye(targetCtx, x + width - 24, cy - 6, 3.3, profile);
    } else if (profile.shape === 'scorpion') {
      targetCtx.fillStyle = profile.body;
      targetCtx.beginPath(); targetCtx.ellipse(cx, cy + 3, width * 0.22, height * 0.27, 0, 0, Math.PI * 2); targetCtx.fill();
      targetCtx.strokeStyle = profile.spot; targetCtx.lineWidth = 4;
      for (let i = -2; i <= 2; i += 1) { targetCtx.beginPath(); targetCtx.moveTo(cx + i * 9, cy + 9); targetCtx.lineTo(cx + i * 11, y + height + 5); targetCtx.stroke(); }
      targetCtx.strokeStyle = profile.body; targetCtx.lineWidth = 7;
      targetCtx.beginPath(); targetCtx.moveTo(cx - 20, cy); targetCtx.quadraticCurveTo(x + 10, y - 5, x + 28, y + 6); targetCtx.stroke();
      targetCtx.fillStyle = profile.accent; targetCtx.beginPath(); targetCtx.arc(x + 27, y + 7, 5, 0, Math.PI * 2); targetCtx.fill();
      renderPredatorEye(targetCtx, x + width - 18, cy - 4, 2.8, profile);
    } else {
      const bird = profile.shape === 'raptor' || profile.shape === 'vulture';
      targetCtx.fillStyle = profile.body;
      targetCtx.beginPath(); targetCtx.ellipse(cx, cy + 2, width * 0.22, height * 0.34, 0, 0, Math.PI * 2); targetCtx.fill();
      targetCtx.fillStyle = profile.belly;
      targetCtx.beginPath(); targetCtx.ellipse(cx + (bird ? 0 : 5), cy + 5, width * 0.11, height * 0.2, 0, 0, Math.PI * 2); targetCtx.fill();
      if (bird) {
        targetCtx.fillStyle = profile.spot;
        targetCtx.beginPath(); targetCtx.moveTo(cx - 7, cy); targetCtx.lineTo(x + 8, y + 7); targetCtx.lineTo(cx - 24, y + height - 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.moveTo(cx + 7, cy); targetCtx.lineTo(x + width - 8, y + 7); targetCtx.lineTo(cx + 24, y + height - 2); targetCtx.fill();
        targetCtx.fillStyle = profile.accent; targetCtx.beginPath(); targetCtx.moveTo(cx + 8, y + 8); targetCtx.lineTo(cx + 20, y + 13); targetCtx.lineTo(cx + 8, y + 17); targetCtx.fill();
        renderPredatorEye(targetCtx, cx - 6, y + 10, 4, profile); renderPredatorEye(targetCtx, cx + 7, y + 10, 4, profile);
      } else {
        targetCtx.fillStyle = profile.body; targetCtx.beginPath(); targetCtx.ellipse(x + width - 22, cy - 3, width * 0.12, height * 0.22, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = profile.spot; targetCtx.beginPath(); targetCtx.moveTo(x + width - 12, cy - 9); targetCtx.lineTo(x + width + 2, cy - 4); targetCtx.lineTo(x + width - 12, cy + 1); targetCtx.fill();
        targetCtx.strokeStyle = profile.spot; targetCtx.lineWidth = 5; targetCtx.beginPath(); targetCtx.moveTo(x + 20, cy + 12); targetCtx.lineTo(x + 8, cy + 18); targetCtx.moveTo(cx, cy + 14); targetCtx.lineTo(cx - 6, cy + 21); targetCtx.stroke();
        renderPredatorEye(targetCtx, x + width - 24, cy - 7, 3.2, profile);
      }
    }
    targetCtx.restore();
  };

  const renderFrog = (targetCtx, x, y, size, shield = 0, profile = frogConfig()) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    if (shield > 0) {
      targetCtx.strokeStyle = 'rgba(147,197,253,.9)';
      targetCtx.lineWidth = 4;
      targetCtx.beginPath();
      targetCtx.arc(cx, cy, size * 0.75, 0, Math.PI * 2);
      targetCtx.stroke();
    }
    targetCtx.fillStyle = profile.body;
    targetCtx.beginPath();
    targetCtx.ellipse(cx, cy + size * 0.07, size * 0.52, size * 0.47, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = profile.belly;
    targetCtx.beginPath();
    targetCtx.ellipse(cx, y + size * 0.66, size * 0.36, size * 0.2, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = profile.body;
    targetCtx.beginPath();
    targetCtx.arc(x + size * 0.28, y + size * 0.25, size * 0.2, 0, Math.PI * 2);
    targetCtx.arc(x + size * 0.72, y + size * 0.25, size * 0.2, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = profile.eye;
    targetCtx.beginPath();
    targetCtx.arc(x + size * 0.28, y + size * 0.22, size * 0.11, 0, Math.PI * 2);
    targetCtx.arc(x + size * 0.72, y + size * 0.22, size * 0.11, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = profile.pupil;
    targetCtx.beginPath();
    targetCtx.arc(x + size * 0.28, y + size * 0.22, size * 0.045, 0, Math.PI * 2);
    targetCtx.arc(x + size * 0.72, y + size * 0.22, size * 0.045, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.strokeStyle = '#166534';
    targetCtx.lineWidth = Math.max(3, size * 0.08);
    targetCtx.beginPath();
    targetCtx.moveTo(x + size * 0.18, y + size * 0.72);
    targetCtx.lineTo(x - size * 0.04, y + size * 0.93);
    targetCtx.moveTo(x + size * 0.82, y + size * 0.72);
    targetCtx.lineTo(x + size * 1.04, y + size * 0.93);
    targetCtx.stroke();
    targetCtx.fillStyle = profile.spot;
    if (profile.pattern === 'spots') {
      [0.38, 0.5, 0.62].forEach((offset, i) => { targetCtx.beginPath(); targetCtx.arc(x + size * offset, y + size * (0.42 + i * 0.08), size * 0.045, 0, Math.PI * 2); targetCtx.fill(); });
    } else if (profile.pattern === 'flanks') {
      targetCtx.fillRect(x + size * 0.08, y + size * 0.45, size * 0.16, size * 0.08);
      targetCtx.fillRect(x + size * 0.76, y + size * 0.45, size * 0.16, size * 0.08);
    } else if (profile.pattern === 'stripe') {
      targetCtx.fillRect(x + size * 0.33, y + size * 0.35, size * 0.34, size * 0.055);
    } else if (profile.pattern === 'translucent') {
      targetCtx.globalAlpha = 0.35;
      targetCtx.fillRect(x + size * 0.42, y + size * 0.48, size * 0.16, size * 0.18);
      targetCtx.globalAlpha = 1;
    }
  };

  const drawFrog = () => {
    const { x, y, size, shield } = state.frog;
    if (isEmojiMode()) {
      if (shield > 0) {
        ctx.strokeStyle = 'rgba(147,197,253,.9)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawCenteredEmoji(ctx, emojiProfiles.frog, x + size / 2, y + size / 2 + 1, 40);
      return;
    }
    renderFrog(ctx, x, y, size, shield);
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
    state.status = `¡${scenarioConfig().name} completo! El siguiente nivel se mueve más rápido y el bonus sube.`;
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
          if (isWaterLane(o.row)) {
            onLog = true;
            state.frog.x += o.speed * delta;
            state.frog.col = Math.round((state.frog.x - 18) / tile);
          } else {
            loseLife(`Chocaste con un obstáculo fijo (${(o.label || 'obstáculo').toLowerCase()}).`);
          }
        }
      }
    });
    if (scenarioConfig().waterRows.includes(state.frog.row) && !onLog) loseLife('Caíste al agua o al hielo. Buscá troncos, témpanos y zonas seguras.');
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

  const drawFrogPreview = () => {
    if (!ui.frogPreview) return;
    const previewCtx = ui.frogPreview.getContext('2d');
    const profile = frogConfig();
    previewCtx.clearRect(0, 0, ui.frogPreview.width, ui.frogPreview.height);
    previewCtx.fillStyle = '#e8f5d9';
    previewCtx.fillRect(0, 0, ui.frogPreview.width, ui.frogPreview.height);
    if (isEmojiMode()) drawCenteredEmoji(previewCtx, emojiProfiles.frog, 72, 72, 66);
    else renderFrog(previewCtx, 43, 38, 58, 0, profile);
    if (ui.frogSpeciesInfo) ui.frogSpeciesInfo.textContent = profile.info;
    if (state && !state.running) draw();
  };

  const openSetup = () => {
    drawFrogPreview();
    if (typeof ui.setupDialog?.showModal === 'function') ui.setupDialog.showModal();
    else start();
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
  ui.start.addEventListener('click', openSetup);
  ui.confirmStart?.addEventListener('click', start);
  ui.difficulty?.addEventListener('change', drawFrogPreview);
  ui.frogSpecies?.addEventListener('change', drawFrogPreview);
  ui.scenario?.addEventListener('change', () => { if (state) state.status = scenarioConfig().message; draw(); });
  ui.visualTheme?.addEventListener('change', () => applyVisualTheme(ui.visualTheme.value));
  ui.visualMode?.addEventListener('change', () => applyVisualMode(ui.visualMode.value));
  ui.guide?.addEventListener('click', () => {
    if (typeof ui.guideDialog?.showModal === 'function') ui.guideDialog.showModal();
  });
  applyVisualTheme(localStorage.getItem('froggerVisualTheme') || ui.visualTheme?.value);
  applyVisualMode(localStorage.getItem('froggerVisualMode') || ui.visualMode?.value);
  ui.best.textContent = localStorage.getItem('froggerBest') || '0';
  state = freshState();
  state.running = false;
  drawFrogPreview();
  draw();
})();
