// Téléporteur – avance de +10% (forêt/glace) ou recule de -10% (lave)

class Teleporter {
  constructor(x, y, forward, levelWidth) {
    this.x          = x;
    this.y          = y;
    this.w          = 40;
    this.h          = 64;
    this.forward    = forward;    // true = avance, false = recule
    this.levelWidth = levelWidth;
    this.t          = 0;
    this.cooldown   = 0;          // anti-doublon téléportation
  }

  update() {
    this.t++;
    if (this.cooldown > 0) this.cooldown--;
  }

  // Téléporte le joueur si pas en cooldown
  teleportPlayer(player) {
    if (this.cooldown > 0) return false;
    const shift = this.levelWidth * 0.10;
    player.x   += this.forward ? shift : -shift;
    player.x    = Math.max(80, Math.min(player.x, this.levelWidth - 200));
    player.vx   = 0; player.vy = 0;
    player.invincible = true; player.invTimer = 60;
    this.cooldown = 150; // 2.5 secondes
    return true;
  }

  draw(ctx, cameraX) {
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);
    if (sx > CONFIG.CANVAS_WIDTH + 10 || sx + this.w < -10) return;

    const pulse  = Math.sin(this.t * 0.07) * 0.25 + 0.75;
    const color  = this.forward ? "#00BCD4" : "#FF5722";
    const color2 = this.forward ? "#006064" : "#BF360C";
    const cx     = sx + 20;
    const cy     = sy + 32;

    ctx.save();

    // Anneau extérieur
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = color;
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18, 30, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Remplissage intérieur
    ctx.fillStyle = color + "44";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 14, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Anneau intérieur (brillant)
    ctx.globalAlpha = pulse * 0.6;
    ctx.strokeStyle = color2;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 8, 18, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();

    // Flèche + label
    ctx.fillStyle = color;
    ctx.font = "bold 11px Arial"; ctx.textAlign = "center";
    ctx.fillText(this.forward ? "→→" : "←←", cx, sy - 6);
    ctx.font = "8px Arial";
    ctx.fillText(this.forward ? "+10%" : "-10%", cx, sy - 16);
  }
}
