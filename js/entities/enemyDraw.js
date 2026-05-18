Enemy.prototype.draw = function(ctx, cameraX) {
  const sx = Math.round(this.x - cameraX);
  const sy = Math.round(this.y);

  if (!this.alive) {
    if (this.deathTimer < 18) {
      ctx.save();
      ctx.globalAlpha = 1 - this.deathTimer / 18;
      ctx.translate(sx + this.w / 2, sy + this.h);
      ctx.scale(1 + this.deathTimer * 0.06, 0.38 - this.deathTimer * 0.02);
      ctx.translate(-this.w / 2, -this.h);
      this._drawSprite(ctx, 0, 0);
      ctx.restore();
    }
    return;
  }
  this._drawSprite(ctx, sx, sy);
};

Enemy.prototype._drawSprite = function(ctx, sx, sy) {
  const bounce = Math.sin(this.animTimer * 0.12) * 2;
  const by = sy + bounce;
  switch (this.type) {
    case "walker":  this._drawWalker(ctx, sx, by);  break;
    case "shooter": this._drawShooter(ctx, sx, by); break;
    case "charger": this._drawCharger(ctx, sx, by); break;
    case "big":     this._drawBig(ctx, sx, by);     break;
    case "bird":    this._drawBird(ctx, sx, by);    break;
  }
  if (this.maxHp > 1 && this.hp > 0) {
    const barW = this.w;
    ctx.fillStyle = "#333"; ctx.fillRect(sx, sy - 7, barW, 5);
    ctx.fillStyle = this.hp <= 1 ? "#f44336" : "#4CAF50";
    ctx.fillRect(sx + 1, sy - 6, (barW - 2) * (this.hp / this.maxHp), 3);
  }
};

Enemy.prototype._drawWalker = function(ctx, sx, sy) {
  ctx.fillStyle = "#2E7D32";
  ctx.fillRect(sx + 4, sy + 10, 24, 22);
  ctx.fillStyle = "#4CAF50";
  ctx.beginPath(); ctx.arc(sx + 16, sy + 10, 14, Math.PI, 0); ctx.fill();
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + 4, sy + 8, 7, 7); ctx.fillRect(sx + 21, sy + 8, 7, 7);
  ctx.fillStyle = "#111";
  ctx.fillRect(sx + 6, sy + 10, 4, 4); ctx.fillRect(sx + 23, sy + 10, 4, 4);
  ctx.fillStyle = "#1B5E20";
  ctx.fillRect(sx + 4, sy + 28, 10, 4); ctx.fillRect(sx + 18, sy + 28, 10, 4);
};

Enemy.prototype._drawShooter = function(ctx, sx, sy) {
  ctx.fillStyle = "#4A148C";
  ctx.fillRect(sx, sy + 6, this.w, this.h - 6);
  ctx.fillStyle = "#7B1FA2";
  ctx.fillRect(sx + 2, sy, this.w - 4, 14);
  const cannonX = this.facing === 1 ? sx + this.w - 4 : sx - 10;
  ctx.fillStyle = "#222"; ctx.fillRect(cannonX, sy + this.h / 2 - 5, 14, 10);
  ctx.fillStyle = "#FF6F00"; ctx.fillRect(cannonX + (this.facing === 1 ? 10 : 0), sy + this.h / 2 - 3, 4, 6);
  ctx.fillStyle = "#FFF176";
  ctx.fillRect(sx + 4, sy + 3, 7, 7); ctx.fillRect(sx + this.w - 11, sy + 3, 7, 7);
  ctx.fillStyle = "#111";
  ctx.fillRect(sx + 6, sy + 5, 3, 4); ctx.fillRect(sx + this.w - 9, sy + 5, 3, 4);
};

Enemy.prototype._drawCharger = function(ctx, sx, sy) {
  ctx.fillStyle = "#B71C1C"; ctx.fillRect(sx, sy + 4, this.w, this.h - 4);
  ctx.fillStyle = "#EF5350"; ctx.fillRect(sx + 2, sy, this.w - 4, 16);
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + 2, sy + 3, 9, 7); ctx.fillRect(sx + this.w - 11, sy + 3, 9, 7);
  ctx.fillStyle = "#111";
  ctx.fillRect(sx + 4, sy + 5, 4, 4); ctx.fillRect(sx + this.w - 9, sy + 5, 4, 4);
  ctx.fillStyle = "#880000";
  ctx.fillRect(sx + 2, sy + 2, 9, 3); ctx.fillRect(sx + this.w - 11, sy + 2, 9, 3);
  if (this.detected && Math.abs(this.vx) > 0) {
    ctx.strokeStyle = "rgba(255,100,100,0.4)"; ctx.lineWidth = 2;
    const dir = this.vx > 0 ? -1 : 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + this.w / 2, sy + 8 + i * 8);
      ctx.lineTo(sx + this.w / 2 + dir * (10 + i * 4), sy + 8 + i * 8);
      ctx.stroke();
    }
  }
};

Enemy.prototype._drawBig = function(ctx, sx, sy) {
  ctx.fillStyle = "#3E2723"; ctx.fillRect(sx, sy, this.w, this.h);
  ctx.fillStyle = "#6D4C41"; ctx.fillRect(sx + 3, sy + 3, this.w - 6, 18);
  ctx.fillStyle = "#FFF";
  ctx.fillRect(sx + 6, sy + 6, 12, 9); ctx.fillRect(sx + this.w - 18, sy + 6, 12, 9);
  ctx.fillStyle = "#F44336";
  ctx.fillRect(sx + 9, sy + 8, 6, 6); ctx.fillRect(sx + this.w - 15, sy + 8, 6, 6);
  ctx.fillStyle = "#111";
  ctx.fillRect(sx + 11, sy + 10, 3, 3); ctx.fillRect(sx + this.w - 13, sy + 10, 3, 3);
};

Enemy.prototype._drawBird = function(ctx, sx, sy) {
  const flap = Math.sin(this.animTimer * 0.28) > 0;

  // Corps ovale gris
  ctx.fillStyle = "#37474F";
  ctx.beginPath(); ctx.ellipse(sx + 18, sy + 14, 14, 10, 0, 0, Math.PI * 2); ctx.fill();

  // Tête
  ctx.fillStyle = "#546E7A";
  ctx.beginPath(); ctx.arc(sx + 30, sy + 9, 9, 0, Math.PI * 2); ctx.fill();

  // Bec orange
  ctx.fillStyle = "#FF9800";
  ctx.beginPath();
  ctx.moveTo(sx + 38, sy + 9); ctx.lineTo(sx + 46, sy + 11); ctx.lineTo(sx + 38, sy + 14);
  ctx.closePath(); ctx.fill();

  // Ailes (haut ou bas selon flap)
  ctx.fillStyle = "#455A64";
  if (flap) {
    ctx.fillRect(sx + 2, sy - 2, 16, 9);
    ctx.fillRect(sx + 20, sy - 2, 12, 9);
  } else {
    ctx.fillRect(sx + 2, sy + 14, 16, 9);
    ctx.fillRect(sx + 20, sy + 14, 12, 9);
  }

  // Oeil
  ctx.fillStyle = "#FFF";  ctx.fillRect(sx + 31, sy + 5, 6, 6);
  ctx.fillStyle = "#111";  ctx.fillRect(sx + 33, sy + 6, 3, 3);
  // Pupille brillante
  ctx.fillStyle = "#F44336"; ctx.fillRect(sx + 33, sy + 6, 2, 2);

  // Ombre sous les pieds (indique l'altitude)
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath(); ctx.ellipse(sx + 18, sy + 38, 14, 4, 0, 0, Math.PI * 2); ctx.fill();
};
