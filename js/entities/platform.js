class Platform {
  constructor(x, y, w, h, type, theme) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.theme  = theme;
    this.startX = x; this.startY = y;
    this.moveDir   = 1;
    this.moveSpeed = 1.4;

    // Normalise les types de mouvement
    if      (type === "moving_h") { this.type = "moving"; this.moveAxis = "x"; this.moveRange = 110; }
    else if (type === "moving_v") { this.type = "moving"; this.moveAxis = "y"; this.moveRange = 70;  }
    else { this.type = type; this.moveAxis = "x"; this.moveRange = 100; }
  }

  update() {
    this.dx = 0; this.dy = 0;
    if (this.type !== "moving") return;
    if (this.moveAxis === "x") {
      this.x += this.moveSpeed * this.moveDir;
      this.dx  = this.moveSpeed * this.moveDir;
      if (Math.abs(this.x - this.startX) > this.moveRange) this.moveDir *= -1;
    } else {
      this.y += this.moveSpeed * this.moveDir;
      this.dy  = this.moveSpeed * this.moveDir;
      if (Math.abs(this.y - this.startY) > this.moveRange) this.moveDir *= -1;
    }
  }

  draw(ctx, cameraX) {
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);
    if (sx > CONFIG.CANVAS_WIDTH + 10 || sx + this.w < -10) return;

    if (this.type === "wall") { this._drawWall(ctx, sx, sy); return; }

    switch (this.theme) {
      case "forest": this._drawForest(ctx, sx, sy); break;
      case "ice":    this._drawIce(ctx, sx, sy);    break;
      case "lava":   this._drawLava(ctx, sx, sy);   break;
      default:
        ctx.fillStyle = "#607D8B";
        ctx.fillRect(sx, sy, this.w, this.h);
    }
  }

  _drawForest(ctx, sx, sy) {
    ctx.fillStyle = "#5D3A1A";
    ctx.fillRect(sx, sy + 6, this.w, this.h - 6);
    ctx.fillStyle = "#2E7D32";
    ctx.fillRect(sx, sy, this.w, 8);
    ctx.fillStyle = "#4A2C10";
    for (let i = 16; i < this.w; i += 20) ctx.fillRect(sx + i, sy + 10, 2, this.h - 12);
    ctx.fillStyle = "#4CAF50";
    for (let i = 5; i < this.w - 5; i += 9) ctx.fillRect(sx + i, sy - 3, 3, 5);
    if (this.type === "moving") {
      ctx.strokeStyle = "rgba(100,255,100,0.5)"; ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, this.w, this.h);
    }
  }

  _drawIce(ctx, sx, sy) {
    const g = ctx.createLinearGradient(sx, sy, sx, sy + this.h);
    g.addColorStop(0, "#B3E5FC"); g.addColorStop(1, "#4FC3F7");
    ctx.fillStyle = g; ctx.fillRect(sx, sy, this.w, this.h);
    ctx.fillStyle = "rgba(255,255,255,0.55)"; ctx.fillRect(sx + 2, sy + 2, this.w - 4, 4);
    ctx.fillStyle = "rgba(255,255,255,0.2)";  ctx.fillRect(sx + 2, sy + 8, this.w - 4, 2);
    ctx.fillStyle = "#E1F5FE";
    for (let i = 8; i < this.w - 8; i += 14) {
      ctx.beginPath();
      ctx.moveTo(sx + i, sy + this.h);
      ctx.lineTo(sx + i + 5, sy + this.h);
      ctx.lineTo(sx + i + 2, sy + this.h + 9);
      ctx.closePath(); ctx.fill();
    }
  }

  _drawLava(ctx, sx, sy) {
    ctx.fillStyle = "#3E2723"; ctx.fillRect(sx, sy, this.w, this.h);
    ctx.fillStyle = "#4E342E"; ctx.fillRect(sx, sy, this.w, 6);
    ctx.strokeStyle = `rgba(255,${80 + Math.sin(Date.now() / 300) * 40},0,0.7)`;
    ctx.lineWidth = 1.5;
    for (let i = 12; i < this.w - 12; i += 22) {
      ctx.beginPath(); ctx.moveTo(sx + i, sy); ctx.lineTo(sx + i + 4, sy + this.h / 2);
      ctx.lineTo(sx + i + 8, sy + this.h); ctx.stroke();
    }
    if (this.type === "moving") {
      ctx.fillStyle = "rgba(255,87,34,0.12)"; ctx.fillRect(sx - 3, sy, this.w + 6, this.h + 4);
      ctx.strokeStyle = "rgba(255,130,0,0.6)"; ctx.lineWidth = 2;
      ctx.strokeRect(sx, sy, this.w, this.h);
    }
  }

  // Mur bloquant dessiné selon le thème du monde
  _drawWall(ctx, sx, sy) {
    const colors = {
      forest: ["#3E2723","#5D3A1A","#4CAF5033"],
      ice:    ["#1565C0","#42A5F5","#E1F5FE33"],
      lava:   ["#212121","#616161","#FF572233"],
    };
    const [dark, light, glow] = colors[this.theme] || ["#333","#666","#FFF3"];
    ctx.fillStyle = dark;  ctx.fillRect(sx, sy, this.w, this.h);
    // Briques
    for (let row = 0; row * 14 < this.h; row++) {
      const oy = row % 2 === 0 ? 0 : 7;
      for (let col = -1; col * 18 < this.w + 18; col++) {
        ctx.strokeStyle = light; ctx.lineWidth = 1;
        ctx.strokeRect(sx + col * 18 + oy, sy + row * 14, 16, 12);
      }
    }
    // Halo coloré pour indiquer le danger
    ctx.fillStyle = glow; ctx.fillRect(sx, sy, this.w, this.h);
    // Panneau "X" en haut
    ctx.fillStyle = "#F44336"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center";
    ctx.fillText("✕", sx + this.w / 2, sy + 16);
  }
}
