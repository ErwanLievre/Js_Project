// Trampoline ça propulse le joueur vers le haut avec une force double

class Trampoline {
  constructor(x, y) {
    this.x    = x;
    this.y    = y;
    this.w    = 52;
    this.h    = 16;
    this.anim = 0; // compression visuelle après rebond
  }

  trigger() {
    this.anim = 14; // frames de compression
  }

  update() {
    if (this.anim > 0) this.anim--;
  }

  draw(ctx, cameraX) {
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);
    if (sx > CONFIG.CANVAS_WIDTH + 10 || sx + this.w < -10) return;

    // Compression visuelle quand on rebondit dessus
    const comp = this.anim > 0 ? Math.round((this.anim / 14) * 5) : 0;

    // Pieds (support)
    ctx.fillStyle = "#555";
    ctx.fillRect(sx + 4,  sy + 12 + comp, 8,  4);
    ctx.fillRect(sx + 40, sy + 12 + comp, 8,  4);

    // Ressorts
    ctx.fillStyle = "#AAA";
    for (let i = 0; i < 4; i++) {
      const rx = sx + 6 + i * 11;
      ctx.fillRect(rx, sy + 6 + comp, 5, 7);
      ctx.fillRect(rx + 1, sy + 5 + comp, 3, 2); // chapeau du ressort
    }

    // Toile élastique (dégradé vert)
    const g = ctx.createLinearGradient(sx, sy, sx, sy + 8);
    g.addColorStop(0, "#81C784");
    g.addColorStop(1, "#2E7D32");
    ctx.fillStyle = g;
    ctx.fillRect(sx, sy + comp, this.w, 8);

    // Reflet
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(sx + 2, sy + 1 + comp, this.w - 4, 2);

    // Texte "!" pour indiquer l'interactivité
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 9px Arial"; ctx.textAlign = "center";
    ctx.fillText("!", sx + this.w / 2, sy - 4);
  }
}
