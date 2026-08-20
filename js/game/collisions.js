// Gestion de toutes les collisions du jeu avec les ennemis, powerups, checkpoints, etc.
Game.prototype._collideEnemies = function() {
  const p = this.player;
  for (const e of this.enemies) {
    if (!e.alive || !rectOverlap(p, e)) continue;
    if (p.starPower) { this._killEnemy(e); continue; }
    // Saut sur ennemi : tombe dessus (normal) ou dessous (gravité inversée)
    const stomped = this.gravityMult === 1
      ? (p.y + p.h - p.vy) <= e.y + 8 && p.vy > 0
      : (p.y - p.vy) >= e.y + e.h - 8  && p.vy < 0;
    if (stomped) {
      const dead = e.hit();
      if (dead) { this._killEnemy(e); }
      else { this.particles.emit(e.x + e.w / 2, e.y, ["#FF7043","#FFF"], 6); }
      p.vy = CONFIG.JUMP_FORCE * this.gravityMult * 0.55;
      this.sound.stomp();
    } else if (!p.invincible) {
      if (p.takeDamage()) { this.sound.die(); if (p.lives <= 0) { this._gameOver(); return; } }
    }
  }
};

Game.prototype._killEnemy = function(e) {
  e.alive = false;
  const colorMap = {
    walker:  ["#4CAF50","#2E7D32","#A5D6A7"],
    shooter: ["#CE93D8","#7B1FA2","#F3E5F5"],
    charger: ["#EF9A9A","#C62828","#FFCDD2"],
    big:     ["#A1887F","#4E342E","#D7CCC8"],
    bird:    ["#90A4AE","#37474F","#CFD8DC"],
  };
  this.particles.emit(e.x + e.w / 2, e.y + e.h / 2, colorMap[e.type] || ["#FFF"], 16);
  const pts = { walker:100, shooter:200, charger:150, big:350, bird:250 };
  this.player.score += pts[e.type] || 100;
};

Game.prototype._collidePowerups = function() {
  const p = this.player;
  for (const pu of this.powerups) {
    if (!pu.alive || !rectOverlap(p, pu)) continue;
    pu.alive = false; this.sound.powerup();
    this.particles.emit(pu.x + 14, pu.y + 14, ["#FFD700","#FFF","#FF80AB"], 10);
    if (pu.type === "star")      p.activateStar();
    else if (pu.type === "life") p.lives++;
    else if (pu.type === "coin") { p.score += 50; this.sound.coin(); }
  }
};

Game.prototype._collideCheckpoints = function() {
  const p = this.player;
  for (const cp of this.checkpoints) {
    if (cp.activated) continue;
    if (Math.abs(p.x - cp.x) < 48 && Math.abs((p.y + p.h) - cp.y) < 80) {
      cp.activated = true;
      p.saveCheckpoint(cp.x, cp.y);
      this.sound.checkpoint(); this._cpMsg = 80;
    }
  }
};

Game.prototype._collideSpikes = function() {
  const p = this.player;
  if (p.invincible) return;
  for (const sp of this.spikes) {
    if (rectOverlap(p, sp)) {
      if (p.takeDamage()) {
        this.sound.die();
        if (p.lives <= 0) { this._gameOver(); return; }
      }
    }
  }
};

// Trampoline ça fait un rebond fort quand le joueur tombe ou saute dessus
Game.prototype._collideTrampolines = function() {
  const p = this.player;
  for (const tr of this.trampolines) {
    if (p.vy > 0 && rectOverlap(p, tr)) {
      p.vy = CONFIG.JUMP_FORCE * 1.85 * this.gravityMult; // force ~double
      p.y  = tr.y - p.h;
      tr.trigger();
      this.particles.emit(tr.x + tr.w / 2, tr.y, ["#66BB6A","#FFF","#A5D6A7"], 8);
      this.sound.powerup();
    }
  }
};

// Téléporteur ça propulse le joueur en avant ou en arrière de 10%
Game.prototype._collideTeleporters = function() {
  const p = this.player;
  for (const tel of this.teleporters) {
    const hitbox = { x: tel.x - 10, y: tel.y - 20, w: tel.w + 20, h: tel.h + 40 };
    if (rectOverlap(p, hitbox)) {
      if (tel.teleportPlayer(p)) {
        this.particles.emit(p.x + 16, p.y + 24, ["#00BCD4","#FFF","#E91E63"], 24);
        this.sound.powerup();
        // Repositionne la cam direct
        this.cameraX = clamp(p.x - CONFIG.CANVAS_WIDTH / 3, 0, Math.max(0, this.levelWidth - CONFIG.CANVAS_WIDTH));
      }
    }
  }
};
