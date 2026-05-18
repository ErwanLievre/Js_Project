class EndFlag {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 50; this.h = 90;
    this.t = 0;
  }

  update() { this.t++; }

  draw(ctx, cameraX) {
    const sx = Math.round(this.x - cameraX);
    if (sx > CONFIG.CANVAS_WIDTH + 20 || sx + this.w < -20) return;

    // Pole
    const g = ctx.createLinearGradient(sx + 16, 0, sx + 22, 0);
    g.addColorStop(0, "#FFD700"); g.addColorStop(1, "#FFA000");
    ctx.fillStyle = g;
    ctx.fillRect(sx + 16, this.y - this.h, 6, this.h);

    // Waving flag
    const wave = Math.sin(this.t * 0.07) * 9;
    const g2 = ctx.createLinearGradient(sx + 22, 0, sx + 60, 0);
    g2.addColorStop(0, "#E91E63"); g2.addColorStop(1, "#9C27B0");
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.moveTo(sx + 22, this.y - this.h);
    ctx.quadraticCurveTo(sx + 42 + wave, this.y - this.h + 16, sx + 22, this.y - this.h + 32);
    ctx.closePath(); ctx.fill();

    // Star + glow
    ctx.save();
    ctx.shadowBlur = 20 + Math.sin(this.t * 0.1) * 8;
    ctx.shadowColor = "#FFD700";
    ctx.fillStyle = "#FFD700";
    this._star(ctx, sx + 19, this.y - this.h - 16, 13, 5);
    ctx.restore();

    ctx.fillStyle = "#FFF";
    ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
    ctx.fillText("FIN", sx + 19, this.y - this.h - 12);
  }

  _star(ctx, cx, cy, r, n) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n - Math.PI / 2;
      const radius = i % 2 === 0 ? r : r * 0.42;
      i === 0 ? ctx.moveTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius)
              : ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
    }
    ctx.closePath(); ctx.fill();
  }
}
