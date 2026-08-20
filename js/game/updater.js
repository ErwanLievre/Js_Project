Game.prototype._update = function() {
  const p  = this.player;
  const H  = CONFIG.CANVAS_HEIGHT;
  const gm = this.gravityMult;

  const _ridden = this._findRiddenPlatform();
  this.platforms.forEach(pl  => pl.update());
  this.trampolines.forEach(tr => tr.update());
  this.teleporters.forEach(tel => tel.update());
  if (_ridden) { p.x += _ridden.dx; p.y += _ridden.dy; }

  const isIce = this._playerOnIce();
  // Lave : ralentit seulement si le joueur touche presque le sol (inférieur à 55px du bas)
  const isLava = this.map.theme === "lava" && p.y + p.h > H - 55 && this.gravityMult === 1;

  p.update(this.keys, this.platforms, isIce, isLava, gm);

  if (p.x < 0) { p.x = 0; p.vx = 0; }

  // Caméra en phase2 on scrolle vers la gauche
  const camTarget = this.map.theme === "phase2"
    ? p.x - CONFIG.CANVAS_WIDTH * 0.65
    : p.x - CONFIG.CANVAS_WIDTH / 3;
  this.cameraX = clamp(camTarget, 0, Math.max(0, this.levelWidth - CONFIG.CANVAS_WIDTH));

  this._updateEnemies();
  this._updateProjectiles();

  this.powerups.forEach(pu    => pu.update());
  this.checkpoints.forEach(cp => cp.update());
  this.particles.update();
  this.endFlag.update();
  if (this._cpMsg > 0) this._cpMsg--;

  this._collideEnemies();
  this._collidePowerups();
  this._collideCheckpoints();
  this._collideSpikes();
  this._collideTrampolines();
  this._collideTeleporters();
  this._checkWin();
  this._checkFall();
  this._updateHUD();
};

// Trouve la plateforme mobile sur laquelle le joueur est posé (avant son déplacement)
Game.prototype._findRiddenPlatform = function() {
  const p  = this.player;
  const gm = this.gravityMult;
  for (const pl of this.platforms) {
    if (pl.type !== "moving") continue;
    const feetY = gm === 1 ? p.y + p.h : p.y; // pied en bas (normal) ou en haut (dans le cas de la gravité inversée)
    const platTop = gm === 1 ? pl.y : pl.y + pl.h;
    if (Math.abs(feetY - platTop) <= 4 && p.x + p.w > pl.x && p.x < pl.x + pl.w) {
      return pl;
    }
  }
  return null;
};

Game.prototype._playerOnIce = function() {
  if (!this.map.slippery) return false;
  const p = this.player;
  for (const pl of this.platforms) {
    if (pl.type === "ice" && p.y + p.h >= pl.y && p.y + p.h <= pl.y + 6
        && p.x + p.w > pl.x && p.x < pl.x + pl.w) return true;
  }
  return false;
};

Game.prototype._updateEnemies = function() {
  for (const e of this.enemies) {
    e.update(this.player);
    if (e.shouldShoot() && Math.abs(this.player.x - e.x) < 450) {
      e.resetShoot(); this.sound.shoot();
      if (e.type === "bird") {
        this.projectiles.push(new Projectile(e.x + e.w / 2, e.y + e.h, 0, true, true));
      } else {
        const dir = this.player.x > e.x ? 1 : -1;
        this.projectiles.push(new Projectile(e.x + e.w / 2, e.y + e.h / 2 - 5, dir, true, false));
      }
    }
  }
};

Game.prototype._updateProjectiles = function() {
  const p = this.player;
  for (let i = this.projectiles.length - 1; i >= 0; i--) {
    const proj = this.projectiles[i];
    proj.update(this.platforms);
    if (!proj.alive) { this.projectiles.splice(i, 1); continue; }
    if (proj.isEnemy && rectOverlap(proj, p)) {
      proj.alive = false; this.projectiles.splice(i, 1);
      if (p.takeDamage()) { this.sound.die(); if (p.lives <= 0) { this._gameOver(); return; } }
    }
  }
};

Game.prototype._checkWin = function() {
  if (this.state === "win") return;
  const fl = this.endFlag;

  if (this.map.theme === "phase2") {
    // Phase 2 gagner en atteignant le côté gauche
    if (this.player.x < 150) this._triggerWin();
    return;
  }

  if (!rectOverlap(this.player, { x: fl.x, y: fl.y - fl.h, w: fl.w, h: fl.h })) return;

  if (this.map.theme === "lava") {
    // Fin de la lave = lancer la phase 2 comme niveau séparé (ça fonctionne pas beaucoup)
    if (this.onPhase2) { this.onPhase2(this.player.score, this.elapsedSec); }
    else                { this._triggerWin(); }
  } else {
    this._triggerWin();
  }
};

Game.prototype._checkFall = function() {
  const p = this.player;
  const outBottom = this.gravityMult ===  1 && p.y > CONFIG.CANVAS_HEIGHT + 60;
  const outTop    = this.gravityMult === -1 && p.y < -300;
  if (!(outBottom || outTop)) return;

  this.sound.die();
  if (p.lives <= 1) {
    p.lives = 0;
    this._gameOver();
    return;
  }
  p.lives--;

  // Checkpoint croisé de campagne : si pas de checkpoint local sur cette map
  // et qu'on a un checkpoint d'une map précédente callback pour revenir dessus
  if (!this.hasLocalCheckpoint() && this.campaignSavedCp && this.onNeedPrevMap) {
    this.onNeedPrevMap(this.campaignSavedCp);
    return;
  }

  p.respawnAtCheckpoint();
};

Game.prototype._triggerWin = function() {
  if (this.state === "win") return;
  this.state = "win"; this.sound.win();
  const kills = this.enemies.filter(e => !e.alive).length;
  this.leaderboard.save(this.mapIndex, this.diffKey, this.player.score, this.elapsedSec);
  setTimeout(() => { if (this.onWin) this.onWin(this.player.score, this.elapsedSec, kills); }, 1100);
};

Game.prototype._gameOver = function() {
  this.state = "gameover";
  cancelAnimationFrame(this.rafId);
  setTimeout(() => { if (this.onGameOver) this.onGameOver(this.player.score, this.elapsedSec); }, 600);
};

Game.prototype._updateHUD = function() {
  const p = this.player;
  const livesEl = document.getElementById("hudLives");
  if (livesEl) {
    livesEl.innerHTML = "";
    for (let i = 0; i < p.lives; i++) livesEl.innerHTML += "❤️";
    if (p.lives === 0) livesEl.textContent = "💀";
  }
  const scoreEl = document.getElementById("hudScore"); if (scoreEl) scoreEl.textContent = `Score: ${p.score}`;
  const timeEl  = document.getElementById("hudTime");  if (timeEl)  timeEl.textContent  = `⏱ ${fmtTime(this.elapsedSec)}`;
  const killsEl = document.getElementById("hudKills"); if (killsEl) killsEl.textContent = `☠ ${this.enemies.filter(e => !e.alive).length}`;
  // Indicateur phase2
  if (this.map.theme === "phase2") {
    if (scoreEl) scoreEl.textContent = `Score: ${p.score} | ← Atteindre le début !`;
  }
};
