class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
  }

  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.vy += 0.3;
    this.vx *= 0.97;
    this.life--;
  }

  draw(ctx, cameraX) {
    ctx.save();
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      Math.round(this.x - cameraX - this.size / 2),
      Math.round(this.y - this.size / 2),
      this.size, this.size
    );
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() { this.particles = []; }

  emit(x, y, colors, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 1.5 + Math.random() * 4;
      const color = colors[(Math.random() * colors.length) | 0];
      const size  = 3 + Math.random() * 7;
      const life  = 18 + Math.floor(Math.random() * 22);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 1.5,
        color, size, life
      ));
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx, cameraX) { this.particles.forEach(p => p.draw(ctx, cameraX)); }
  clear()            { this.particles = []; }
}
