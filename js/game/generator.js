// Génère un niveau en plaçant les entités sur les plateformes prédéfinies de levels.js

function generateLevel(mapConfig, diffKey) {
  const def     = LEVEL_DEFS[mapConfig.theme];
  const diff    = CONFIG.DIFFICULTIES[diffKey] || CONFIG.DIFFICULTIES.hard;
  const H       = CONFIG.CANVAS_HEIGHT;
  const groundY = H - 40;

  const platforms   = [];
  const enemies     = [];
  const powerups    = [];
  const checkpoints = [];
  const spikes      = [];
  const trampolines = [];
  const teleporters = [];

  // ── Phase 2 : niveau spécial gravité inversée ─────────────────────
  if (mapConfig.theme === "phase2") {
    return _generatePhase2(def, diff, H);
  }

  // ── Sol : segments avec trous (trou 🕳️ = espace entre deux segments) ──
  for (const [sx, ex] of def.groundSegs) {
    platforms.push(new Platform(sx, groundY, ex - sx, 40, "ground", mapConfig.theme));
  }

  // ── Plateformes prédéfinies ────────────────────────────────────────
  for (const pd of def.platformDefs) {
    let type = mapConfig.theme === "ice" ? "ice" : "normal";
    if (pd.movable && diffKey === "medium") type = "moving_h";
    if (pd.movable && diffKey === "hard")   type = "moving_v";

    const plat = new Platform(pd.x, pd.y, pd.w, 20, type, mapConfig.theme);
    platforms.push(plat);

    // Piques sous les plateformes de GLACE seulement
    if (mapConfig.theme === "ice") {
      spikes.push(new Spike(pd.x + 4, pd.y + 20, pd.w - 8, "ice", "down"));
    }

    // Ennemis placés intelligemment selon le type
    if (pd.x > 350) {
      _spawnEnemies(enemies, pd, plat, diffKey, mapConfig, groundY, type);
    }

    // Cœur ❤️ ou power-up sur la plateforme (30% de chance)
    if (Math.random() < 0.30) {
      const pool = diff.hasBig ? ["star","life","coin"] : ["life","coin"];
      const pt   = pool[Math.floor(Math.random() * pool.length)];
      powerups.push(new PowerUp(pd.x + pd.w / 2 - 14, pd.y - 42, pt));
    }
  }

  // ── Murs bloquants (mode Impossible uniquement) ────────────────────
  if (diffKey === "hard") {
    for (const wd of def.wallDefs) {
      platforms.push(new Platform(wd.x, wd.y, 18, wd.h, "wall", mapConfig.theme));
    }
  }

  // ── Trampolines ───────────────────────────────────────────────────
  for (const td of def.trampolineXs) {
    trampolines.push(new Trampoline(td.x, td.y));
  }

  // ── Téléporteurs (forêt/glace = avance +10%, lave = recule -10%) ──
  for (const tx of def.teleporterXs) {
    const forward = mapConfig.theme !== "lava";
    teleporters.push(new Teleporter(tx, groundY - 64, forward, def.levelWidth));
  }

  // ── Oiseaux 💣 (mode Impossible uniquement) ───────────────────────
  if (diffKey === "hard") {
    _spawnBirds(enemies, def.levelWidth, diff);
  }

  // ── Piques au sol (glace uniquement) ─────────────────────────────
  if (mapConfig.theme === "ice") {
    _addGroundSpikes(spikes, groundY, def.levelWidth, diffKey);
  }

  // ── Checkpoints ───────────────────────────────────────────────────
  for (const cpX of def.checkpointXs) {
    checkpoints.push(new Checkpoint(cpX, groundY));
  }

  const endX    = def.levelWidth - 300;
  const endFlag = new EndFlag(endX, groundY);

  return { platforms, enemies, powerups, checkpoints, spikes, trampolines, teleporters, endFlag, levelWidth: def.levelWidth };
}

// Génère le niveau spécial phase2 (gravité inversée, marche vers la gauche)
function _generatePhase2(def, diff, H) {
  const platforms   = [];
  const enemies     = [];
  const powerups    = [];
  const checkpoints = [];

  // Plafond = "sol" en gravité inversée | Sol normal pour les ennemis
  platforms.push(new Platform(0, -40, def.levelWidth, 40, "ground", "lava"));
  platforms.push(new Platform(0, 460, def.levelWidth, 40, "ground", "lava"));

  // Plateformes suspendues – le joueur marche sur leur dessous
  for (const pd of def.platformDefs) {
    let type = pd.movable ? "moving_h" : "normal";
    const plat = new Platform(pd.x, pd.y, pd.w, 20, type, "lava");
    platforms.push(plat);

    // 1 ennemi walker au sol sous chaque plateforme
    if (Math.random() < 0.7) {
      const eX = pd.x + rand(20, Math.max(25, pd.w - 50));
      const e  = new Enemy(eX, 460 - 32, "walker", "hard", null);
      e.patrolLeft  = pd.x;
      e.patrolRight = pd.x + pd.w;
      enemies.push(e);
    }
    // Power-up sur le dessus de la plateforme (visible quand on vole dessous)
    if (Math.random() < 0.4) {
      powerups.push(new PowerUp(pd.x + pd.w / 2 - 14, pd.y - 42, "coin"));
    }
  }

  // Checkpoints au plafond (y=0)
  for (const cpX of def.checkpointXs) {
    checkpoints.push(new Checkpoint(cpX, 0));
  }

  const endFlag = new EndFlag(80, -40);

  return {
    platforms, enemies, powerups, checkpoints,
    spikes: [], trampolines: [], teleporters: [],
    endFlag, levelWidth: def.levelWidth,
  };
}

// Ennemi sur plateforme normale/glace, ou au sol sous les plateformes moving_h
function _spawnEnemies(enemies, pd, plat, diffKey, mapConfig, groundY, platType) {
  const diff = CONFIG.DIFFICULTIES[diffKey];

  if (platType === "moving_h") {
    // Ennemis au sol SOUS la plateforme mobile (pas dessus)
    const max = Math.max(1, Math.floor(rand(1, 3) * diff.groundEnemyMult));
    for (let i = 0; i < max; i++) {
      const eX = pd.x + rand(20, Math.max(25, pd.w - 50));
      const e  = new Enemy(eX, groundY - 32, "walker", diffKey, null);
      e.patrolLeft  = pd.x;
      e.patrolRight = pd.x + pd.w;
      if (mapConfig.theme === "lava") e.addHp(diff.lavaHpBonus);
      enemies.push(e);
    }
    return;
  }

  // Sur les autres plateformes : 1 à 2 ennemis selon difficulté (80% chance)
  const maxE = diffKey === "easy" ? 1 : 2;
  const count = Math.random() < 0.80 ? randInt(1, maxE) : 0;
  for (let i = 0; i < count; i++) {
    const type = _pickEnemyType(diff);
    const eH   = type === "big" ? 50 : type === "shooter" ? 36 : 32;
    const eX   = pd.x + rand(8 + i * 60, Math.max(12, pd.w - eH - 8));
    if (eX + eH > pd.x + pd.w) continue; // pas de débordement
    const e    = new Enemy(eX, pd.y - eH, type, diffKey, platType === "moving_v" ? null : plat);
    if (platType === "moving_v") { e.patrolLeft = pd.x; e.patrolRight = pd.x + pd.w; }
    if (mapConfig.theme === "lava") e.addHp(diff.lavaHpBonus);
    enemies.push(e);
  }
}

// 6 oiseaux volants répartis sur le niveau (impossible)
function _spawnBirds(enemies, levelWidth, diff) {
  const count   = 6;
  const spacing = (levelWidth - 900) / count;
  for (let i = 0; i < count; i++) {
    const bX = 900 + i * spacing + rand(-60, 60);
    const bY = rand(110, 200);
    enemies.push(new Enemy(bX, bY, "bird", "hard", null));
  }
}

function _pickEnemyType(diff) {
  const r = Math.random();
  if (diff.hasBig      && r < 0.12) return "big";
  if (diff.hasChargers && r < 0.25) return "charger";
  if (diff.hasShooters && r < 0.25) return "shooter";
  return "walker";
}

// Piques au sol pour la glace uniquement
function _addGroundSpikes(spikes, groundY, levelW, diffKey) {
  const count  = {easy:5, medium:10, hard:16}[diffKey] || 0;
  const spikeY = groundY - 16;
  for (let i = 0; i < count; i++) {
    const sx = rand(600, levelW - 500) | 0;
    const sw = rand(22, 44) | 0;
    spikes.push(new Spike(sx, spikeY, sw, "ice", "up"));
  }
}
