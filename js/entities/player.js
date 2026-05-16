class Player {
  constructor(x, y, lives) {
    this.x = x; this.y = y;
    this.w = 32;
    this.normalH = 48;
    this.crouchH  = 24;
    this.h = this.normalH;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.crouching = false;
    this.lives = lives;
    this.score = 0;
    this.facing = 1;
    this.animFrame = 0; this.animTimer = 0;
    this.invincible = false; this.invTimer = 0;
    this.starPower = false; this.starTimer = 0;
    // Checkpoint save state
    this.cpX = x; this.cpY = y;
    this.cpLives = lives; this.cpScore = 0;
  }

  update(keys, platforms, isIce, isLava = false, gravityMult = 1) {
    // ── Crouch ───────────────────────────────────────────────────────
    if (keys.crouch && !this.crouching) {
      this.crouching = true;
      this.h = this.crouchH;
      this.y += (this.normalH - this.crouchH); // keep feet at same position
    }
    if (!keys.crouch && this.crouching) {
      this._tryUncrouch(platforms);
    }

    // ── Horizontal movement ──────────────────────────────────────────
    const maxSpd  = isLava ? CONFIG.PLAYER_SPEED * 0.45 : CONFIG.PLAYER_SPEED;
    const friction = isIce ? 0.97 : 0.8;

    if (keys.left)       { this.vx = Math.max(this.vx - 0.9, -maxSpd); this.facing = -1; }
    else if (keys.right) { this.vx = Math.min(this.vx + 0.9,  maxSpd); this.facing =  1; }
    else                 { this.vx *= friction; if (Math.abs(this.vx) < 0.1) this.vx = 0; }

    // ── Jump ─────────────────────────────────────────────────────────
    if (keys.jump && this.onGround && !this.crouching) {
      this.vy = CONFIG.JUMP_FORCE * gravityMult;
      this.onGround = false;
    }

    // ── Gravity ──────────────────────────────────────────────────────
    this.vy += CONFIG.GRAVITY * gravityMult;
    // Terminal velocity (clamped in the direction of gravity)
    if (gravityMult === 1)  this.vy = Math.min(this.vy,  20);
    else                    this.vy = Math.max(this.vy, -20);

    // ── Move X → resolve X ──────────────────────────────────────────
    this.x += this.vx;
    for (const pl of platforms) this._resolveX(pl);

    // ── Move Y → resolve Y ──────────────────────────────────────────
    this.onGround = false;
    this.y += this.vy;
    for (const pl of platforms) this._resolveY(pl, gravityMult);

    // ── Animation ────────────────────────────────────────────────────
    this.animTimer++;
    if (this.onGround && Math.abs(this.vx) > 0.5) {
      if (this.animTimer % 7 === 0) this.animFrame = (this.animFrame + 1) % 4;
    } else {
      this.animFrame = this.vy * gravityMult < 0 ? 2 : 3;
    }

    // ── Timers ───────────────────────────────────────────────────────
    if (this.invincible && --this.invTimer  <= 0) this.invincible = false;
    if (this.starPower   && --this.starTimer <= 0) { this.starPower = false; this.invincible = false; }
  }

  _tryUncrouch(platforms) {
    const newY = this.y - (this.normalH - this.crouchH);
    const test = { x: this.x, y: newY, w: this.w, h: this.normalH };
    for (const pl of platforms) {
      if (rectOverlap(test, pl)) return; // blocked by ceiling
    }
    this.crouching = false;
    this.h = this.normalH;
    this.y = newY;
  }

  _resolveX(plat) {
    if (!rectOverlap(this, plat)) return;
    const overR = this.x + this.w - plat.x;
    const overL = plat.x + plat.w - this.x;
    if (overR < overL) this.x = plat.x - this.w;
    else               this.x = plat.x + plat.w;
    this.vx = 0;
  }

  _resolveY(plat, gravityMult = 1) {
    if (!rectOverlap(this, plat)) return;
    if (gravityMult === 1) {
      // Normal: land on top when moving down, bounce off ceiling when moving up
      if (this.vy >= 0) { this.y = plat.y - this.h; this.vy = 0; this.onGround = true; }
      else              { this.y = plat.y + plat.h; this.vy = 0; }
    } else {
      // Inverted: land on bottom of platform when moving up (vy <= 0)
      if (this.vy <= 0) { this.y = plat.y + plat.h; this.vy = 0; this.onGround = true; }
      else              { this.y = plat.y - this.h; this.vy = 0; }
    }
  }

  takeDamage() {
    if (this.invincible) return false;
    this.lives--;
    this.invincible = true; this.invTimer = 130;
    return true;
  }

  activateStar() {
    this.starPower = true; this.starTimer = 300;
    this.invincible = true; this.invTimer = 300;
  }

  saveCheckpoint(x, y) {
    this.cpX = x; this.cpY = y;
    this.cpLives = this.lives; this.cpScore = this.score;
  }

  respawnAtCheckpoint() {
    this.x = this.cpX + 30; this.y = this.cpY - 80;
    this.vx = 0; this.vy = 0;
    this.lives = this.cpLives; this.score = this.cpScore;
    this.invincible = true; this.invTimer = 130;
    this.crouching = false; this.h = this.normalH;
  }

  draw(ctx, cameraX, gravityMult = 1) {
    if (this.invincible && !this.starPower && Math.floor(Date.now() / 80) % 2 === 0) return;
    const sx = Math.round(this.x - cameraX);
    const sy = Math.round(this.y);

    ctx.save();

    // Flip vertically when gravity is inverted
    if (gravityMult === -1) {
      ctx.translate(sx + this.w / 2, sy + this.h / 2);
      ctx.scale(1, -1);
      ctx.translate(-(sx + this.w / 2), -(sy + this.h / 2));
    }

    if (this.starPower) { ctx.shadowBlur = 18; ctx.shadowColor = `hsl(${(Date.now() / 8) % 360},100%,60%)`; }

    if (this.crouching) {
      this._drawCrouched(ctx, sx, sy);
    } else {
      this._drawStanding(ctx, sx, sy);
    }
    ctx.restore();
  }

  _drawStanding(ctx, sx, sy) {
    // Legs
    ctx.fillStyle = "#1a2a5e";
    const leg = [0, 5, 0, -5][this.animFrame] || 0;
    ctx.fillRect(sx + 4,  sy + 38, 10, 10 + Math.max(0,  leg));
    ctx.fillRect(sx + 18, sy + 38, 10, 10 + Math.max(0, -leg));
    // Body
    ctx.fillStyle = this.starPower ? `hsl(${(Date.now() / 7) % 360},100%,55%)` : "#3A7BD5";
    ctx.fillRect(sx + 2, sy + 18, 28, 24);
    ctx.fillStyle = "#1a2a5e";
    ctx.fillRect(sx + 6,  sy + 18, 6, 6);
    ctx.fillRect(sx + 20, sy + 18, 6, 6);
    // Head
    ctx.fillStyle = "#FDBCB4"; ctx.fillRect(sx + 4, sy + 2, 24, 20);
    ctx.fillStyle = "#D32F2F"; ctx.fillRect(sx + 2, sy + 2, 28, 7);
    ctx.fillRect(sx + 5, sy - 5, 22, 8);
    ctx.fillStyle = "#FFF"; ctx.font = "bold 8px Arial"; ctx.textAlign = "center";
    ctx.fillText("B", sx + 16, sy + 7);
    // Eye + mustache
    const eyeX = this.facing === 1 ? sx + 20 : sx + 6;
    ctx.fillStyle = "#333"; ctx.fillRect(eyeX, sy + 7, 5, 5);
    ctx.fillStyle = "#FFF"; ctx.fillRect(eyeX + (this.facing === 1 ? 2 : 0), sy + 7, 2, 2);
    ctx.fillStyle = "#6B3A2A"; ctx.fillRect(sx + 8, sy + 17, 16, 3);
  }

  _drawCrouched(ctx, sx, sy) {
    // Squished: half-height duck pose
    ctx.fillStyle = "#1a2a5e";
    ctx.fillRect(sx + 4, sy + 14, 24, 10);
    ctx.fillStyle = this.starPower ? `hsl(${(Date.now() / 7) % 360},100%,55%)` : "#3A7BD5";
    ctx.fillRect(sx + 2, sy + 4, 28, 12);
    ctx.fillStyle = "#FDBCB4"; ctx.fillRect(sx + 4, sy, 24, 8);
    ctx.fillStyle = "#D32F2F"; ctx.fillRect(sx + 2, sy, 28, 5);
    ctx.fillStyle = "#FFF"; ctx.font = "bold 7px Arial"; ctx.textAlign = "center";
    ctx.fillText("B", sx + 16, sy + 4);
    const eyeX = this.facing === 1 ? sx + 20 : sx + 6;
    ctx.fillStyle = "#333"; ctx.fillRect(eyeX, sy + 2, 4, 4);
  }
}
