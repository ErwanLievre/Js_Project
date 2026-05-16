Game.prototype._draw = function() {
  const ctx = this.ctx;
  const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;

  this._drawBackground(ctx, W, H);

  this.spikes.forEach(sp       => sp.draw(ctx, this.cameraX));
  this.platforms.forEach(pl    => pl.draw(ctx, this.cameraX));
  this.trampolines.forEach(tr  => tr.draw(ctx, this.cameraX));
  this.teleporters.forEach(tel => tel.draw(ctx, this.cameraX));
  this.checkpoints.forEach(cp  => cp.draw(ctx, this.cameraX));
  this.endFlag.draw(ctx, this.cameraX);

  // Phase 2 start flag at x=100
  if (this.phase === 2) {
    this._drawPhase2Flag(ctx);
  }

  this.powerups.filter(pu => pu.alive).forEach(pu => pu.draw(ctx, this.cameraX));
  this.enemies.forEach(e   => e.draw(ctx, this.cameraX));
  this.projectiles.forEach(pr => pr.draw(ctx, this.cameraX));
  this.particles.draw(ctx, this.cameraX);

  this.player.draw(ctx, this.cameraX, this.gravityMult);

  this._drawHUDCanvas(ctx, W, H);

  if (this.state === "win") {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#FFD700"; ctx.font = "bold 52px Arial"; ctx.textAlign = "center";
    ctx.shadowBlur = 20; ctx.shadowColor = "#FFD700";
    ctx.fillText("🏆 VICTOIRE!", W / 2, H / 2);
    ctx.shadowBlur = 0;
  }
};

Game.prototype._drawPhase2Flag = function(ctx) {
  const sx = Math.round(100 - this.cameraX);
  const groundY = CONFIG.CANVAS_HEIGHT - 40;
  // Simple finish flag at x=100
  ctx.fillStyle = "#FFD700";
  ctx.fillRect(sx + 16, groundY - 80, 5, 80);
  ctx.fillStyle = "#E91E63";
  ctx.fillRect(sx + 21, groundY - 80, 24, 20);
  ctx.fillStyle = "#FFF"; ctx.font = "8px Arial"; ctx.textAlign = "left";
  ctx.fillText("DÉPART", sx + 22, groundY - 66);
};

Game.prototype._drawHUDCanvas = function(ctx, W, H) {
  // Phase 2 banner
  if (this.phase === 2) {
    ctx.save();
    const alpha = 0.7 + Math.sin(Date.now() / 400) * 0.15;
    ctx.fillStyle = `rgba(180,0,0,${alpha * 0.12})`;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = `rgba(255,80,80,${alpha})`;
    ctx.font = "bold 15px Arial"; ctx.textAlign = "center";
    ctx.fillText("⚠ PHASE 2 — GRAVITÉ INVERSÉE — Remonte au début !", W / 2, 22);
    ctx.restore();
  }

  // Checkpoint message
  if (this._cpMsg > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, this._cpMsg / 20);
    const msg = this.phase === 2 ? "⚠ PHASE 2 — GRAVITÉ INVERSÉE !" : "✓ CHECKPOINT!";
    ctx.fillStyle = this.phase === 2 ? "#FF5722" : "#4CAF50";
    ctx.font = "bold 26px Arial"; ctx.textAlign = "center";
    ctx.shadowBlur = 10; ctx.shadowColor = "#000";
    ctx.fillText(msg, W / 2, 110);
    ctx.restore();
  }

  // Lava slow warning
  const p = this.player;
  if (this.map.theme === "lava" && p.y + p.h > CONFIG.CANVAS_HEIGHT - 140 && this.phase === 1) {
    ctx.save();
    ctx.fillStyle = "rgba(255,87,34,0.18)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,160,0,0.7)";
    ctx.font = "13px Arial"; ctx.textAlign = "center";
    ctx.fillText("🔥 Chaleur de la lave — déplacement ralenti !", W / 2, H - 26);
    ctx.restore();
  }

  // Star power flash
  if (p.starPower) {
    ctx.fillStyle = `hsla(${(Date.now() / 8) % 360},80%,60%,0.08)`;
    ctx.fillRect(0, 0, W, H);
  }

  // Progress bar
  const progress = this.phase === 2
    ? clamp(1 - (p.x / this.levelWidth), 0, 1)
    : clamp(p.x / this.levelWidth, 0, 1);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(10, H - 14, W - 20, 7);
  ctx.fillStyle = this.phase === 2 ? "#FF5722" : "#4CAF50";
  ctx.fillRect(10, H - 14, (W - 20) * progress, 7);
  ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "8px Arial"; ctx.textAlign = "right";
  ctx.fillText(`${Math.round(progress * 100)}%`, W - 12, H - 7);
};

Game.prototype._drawBackground = function(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, this.map.bgColors[0]);
  g.addColorStop(1, this.map.bgColors[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  if (this.map.theme === "forest") this._bgForest(ctx, W, H);
  else if (this.map.theme === "ice")  this._bgIce(ctx, W, H);
  else if (this.map.theme === "lava") this._bgLava(ctx, W, H);

  // Red tint for phase 2
  if (this.phase === 2) {
    ctx.fillStyle = "rgba(60,0,0,0.35)";
    ctx.fillRect(0, 0, W, H);
  }
};

Game.prototype._bgForest = function(ctx, W, H) {
  const co = (this.cameraX * 0.2) % (W + 240);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  [[90,70,55],[270,55,70],[480,80,50],[680,65,60]].forEach(([cx,cy,r]) => {
    const x = (cx - co % (W + 240) + W + 240) % (W + 240) - 60;
    ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.7, cy - r * 0.35, r * 0.72, 0, Math.PI * 2);
    ctx.arc(x + r * 1.45, cy, r * 0.6, 0, Math.PI * 2); ctx.fill();
  });
  const to = this.cameraX * 0.35;
  ctx.fillStyle = "#1B5E20";
  for (let i = 0; i < 11; i++) {
    const tx = ((i * 210 - to % 2100) % (W + 420) + W + 420) % (W + 420) - 210;
    ctx.beginPath(); ctx.moveTo(tx, H - 40); ctx.lineTo(tx - 38, H - 190); ctx.lineTo(tx + 38, H - 190); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx, H - 140); ctx.lineTo(tx - 28, H - 260); ctx.lineTo(tx + 28, H - 260); ctx.closePath(); ctx.fill();
  }
};

Game.prototype._bgIce = function(ctx, W, H) {
  const so = this.cameraX * 0.08;
  ctx.fillStyle = "rgba(200,220,255,0.7)";
  for (let i = 0; i < 35; i++) {
    const sx = ((i * 89 + 17 - so) % W + W) % W;
    const sy = (i * 61 + 11) % (H * 0.55);
    ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }
  for (let i = 0; i < 3; i++) {
    const a = 0.07 + Math.sin(Date.now() / 1100 + i * 1.1) * 0.04;
    ctx.fillStyle = `hsla(${170 + i * 35},80%,55%,${a})`;
    ctx.fillRect(0, 40 + i * 28, W, 18);
  }
  const mg = ctx.createLinearGradient(0, H - 110, 0, H - 40);
  mg.addColorStop(0, "rgba(176,224,230,0)"); mg.addColorStop(1, "rgba(176,224,230,0.28)");
  ctx.fillStyle = mg; ctx.fillRect(0, H - 110, W, 70);
};

Game.prototype._bgLava = function(ctx, W, H) {
  const ro = this.cameraX * 0.25;
  ctx.fillStyle = "#2D1004";
  for (let i = 0; i < 6; i++) {
    const rx = ((i * 220 - ro) % (W + 440) + W + 440) % (W + 440) - 220;
    ctx.fillRect(rx, H - 40 - (60 + i * 20), 80 + i * 15, 60 + i * 20);
  }
  const lg = ctx.createLinearGradient(0, H - 90, 0, H - 40);
  lg.addColorStop(0, "rgba(255,87,34,0)");
  lg.addColorStop(1, `rgba(255,87,34,${0.28 + Math.sin(Date.now() / 500) * 0.08})`);
  ctx.fillStyle = lg; ctx.fillRect(0, H - 90, W, 50);
  const eo = this.cameraX * 0.12;
  for (let i = 0; i < 14; i++) {
    const ex = ((i * 143 + Date.now() * 0.04 - eo) % (W + 100) + W + 100) % (W + 100) - 50;
    const ey = H - 42 - ((Date.now() * 0.04 + i * 110) % (H * 0.75));
    if (ey > 0) {
      ctx.globalAlpha = 0.35 + Math.sin(Date.now() / 300 + i) * 0.15;
      ctx.fillStyle = i % 2 === 0 ? "#FF9800" : "#FF5722";
      ctx.fillRect(ex, ey, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
};
