class PowerUp {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.w = 28; this.h = 28;
    this.type  = type; // 'star' | 'life' | 'coin'
    this.alive = true;
    this.t     = Math.random() * Math.PI * 2;
    this.baseY = y;
  }

  update() {
    this.t += 0.05;
    this.y = this.baseY + Math.sin(this.t) * 5;
  }

  draw(ctx, cameraX) {
    if (!this.alive) return;
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);

    ctx.save();
    ctx.translate(sx + 14, sy + 14);
    ctx.rotate(this.t * 0.4);
    ctx.translate(-14, -14);

    if (this.type === "star")       this._drawStar(ctx);
    else if (this.type === "life")  this._drawHeart(ctx);
    else if (this.type === "coin")  this._drawCoin(ctx);

    ctx.restore();
  }

  _drawStar(ctx) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 13 : 5;
      i === 0 ? ctx.moveTo(14 + Math.cos(a) * r, 14 + Math.sin(a) * r)
              : ctx.lineTo(14 + Math.cos(a) * r, 14 + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill();
    // Shine dot
    ctx.fillStyle = "#FFF9";
    ctx.fillRect(10, 6, 4, 4);
  }

  _drawHeart(ctx) {
    ctx.fillStyle = "#E91E63";
    const cx = 14, cy = 11, s = 11;
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.3);
    ctx.bezierCurveTo(cx, cy - s * 0.15, cx - s * 0.85, cy - s * 0.15, cx - s * 0.85, cy + s * 0.35);
    ctx.bezierCurveTo(cx - s * 0.85, cy + s * 0.75, cx, cy + s, cx, cy + s);
    ctx.bezierCurveTo(cx, cy + s, cx + s * 0.85, cy + s * 0.75, cx + s * 0.85, cy + s * 0.35);
    ctx.bezierCurveTo(cx + s * 0.85, cy - s * 0.15, cx, cy - s * 0.15, cx, cy + s * 0.3);
    ctx.closePath(); ctx.fill();
  }

  _drawCoin(ctx) {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath(); ctx.arc(14, 14, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFA000";
    ctx.beginPath(); ctx.arc(14, 14, 7,  0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
    ctx.fillText("$", 14, 18);
  }
}
