// Spike entity
// direction "down" = icicles sous les plateformes de glace
// direction "up"   = pics sur le sol (obstacles au sol)
class Spike {
  constructor(x, y, w, theme = "ice", direction = "down") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = 16;
    this.theme     = theme;
    this.direction = direction;
  }

  draw(ctx, cameraX) {
    const sx = Math.round(this.x - cameraX);
    if (sx > CONFIG.CANVAS_WIDTH + 10 || sx + this.w < -10) return;

    if (this.direction === "up") {
      this._drawUp(ctx, sx);
    } else {
      this._drawDown(ctx, sx);
    }
  }

  // Pointes vers le bas (sous une plateforme)
  _drawDown(ctx, sx) {
    ctx.fillStyle   = "#E1F5FE";
    ctx.strokeStyle = "#4FC3F7";
    ctx.lineWidth   = 1;
    for (let i = 3; i < this.w - 3; i += 11) {
      ctx.beginPath();
      ctx.moveTo(sx + i,     this.y);
      ctx.lineTo(sx + i + 7, this.y);
      ctx.lineTo(sx + i + 3, this.y + this.h);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  }

  // Pointes vers le haut (sur le sol)
  _drawUp(ctx, sx) {
    // Couleur selon le thème de la map
    const colors = {
      forest: { fill: "#78909C", stroke: "#455A64" },
      ice:    { fill: "#B0BEC5", stroke: "#607D8B" },
      lava:   { fill: "#FF5722", stroke: "#BF360C" },
    };
    const c = colors[this.theme] || colors["forest"];
    ctx.fillStyle   = c.fill;
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth   = 1;

    // Base sur le sol (this.y + this.h), pointes vers le haut (this.y)
    for (let i = 3; i < this.w - 3; i += 11) {
      ctx.beginPath();
      ctx.moveTo(sx + i,     this.y + this.h);
      ctx.lineTo(sx + i + 7, this.y + this.h);
      ctx.lineTo(sx + i + 3, this.y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  }
}
