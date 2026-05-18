// Projectile – tir horizontal (ennemis/joueur) ou bombe tombante (oiseaux)

class Projectile {
  constructor(x, y, dir, isEnemy, isBomb = false) {
    this.x       = x; this.y = y;
    this.w       = 10; this.h = 10;
    this.vx      = isBomb ? (dir * 1.5) : (dir * 6);
    this.vy      = isBomb ? -1 : 0; // légère impulsion vers le bas
    this.isEnemy = isEnemy;
    this.isBomb  = isBomb;
    this.alive   = true;
    this.age     = 0;
  }

  update(platforms) {
    // Les bombes tombent avec la gravité
    if (this.isBomb) this.vy = Math.min(this.vy + 0.45, 14);
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (this.age > 240) { this.alive = false; return; }
    for (const plat of platforms) {
      if (rectOverlap(this, plat)) { this.alive = false; return; }
    }
  }

  draw(ctx, cameraX) {
    if (!this.alive) return;
    const sx = this.x - cameraX + 5;
    const sy = this.y + 5;
    ctx.save();

    if (this.isBomb) {
      // Bombe ronde noire avec mèche allumée
      ctx.fillStyle = "#1A1A1A";
      ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fill();
      // Mèche
      ctx.strokeStyle = "#888"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx, sy - 7); ctx.lineTo(sx + 4, sy - 13); ctx.stroke();
      // Flamme de mèche (scintille)
      if (Math.floor(this.age / 4) % 2 === 0) {
        ctx.fillStyle = "#FF9800";
        ctx.beginPath(); ctx.arc(sx + 4, sy - 14, 3, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#FFD700";
        ctx.beginPath(); ctx.arc(sx + 4, sy - 13, 2, 0, Math.PI * 2); ctx.fill();
      }
      // Reflet
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath(); ctx.arc(sx - 2, sy - 2, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      const color = this.isEnemy ? "#FF6D00" : "#00BCD4";
      ctx.shadowBlur = 8; ctx.shadowColor = color;
      ctx.fillStyle  = color;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }
}
