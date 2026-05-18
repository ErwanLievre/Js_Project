class Checkpoint {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 16; this.h = 60;
    this.activated = false;
    this.t = 0;
  }

  update() { if (this.activated) this.t += 0.08; }

  draw(ctx, cameraX) {
    const sx = Math.round(this.x - cameraX);
    // Pole
    ctx.fillStyle = this.activated ? "#FFD700" : "#90A4AE";
    ctx.fillRect(sx + 6, this.y - this.h, 4, this.h);
    // Flag
    ctx.fillStyle = this.activated ? "#4CAF50" : "#EF5350";
    const wave = this.activated ? Math.sin(this.t) * 5 : 0;
    ctx.beginPath();
    ctx.moveTo(sx + 10, this.y - this.h);
    ctx.lineTo(sx + 30 + wave, this.y - this.h + 9);
    ctx.lineTo(sx + 10, this.y - this.h + 18);
    ctx.closePath(); ctx.fill();
    // Base
    ctx.fillStyle = "#5D4037";
    ctx.fillRect(sx + 2, this.y - 5, 12, 7);
  }
}
