class Enemy {
  constructor(x, y, type, diffKey, platform) {
    this.x = x; this.y = y;
    this.type = type;
    this.platform = platform;
    this.alive = true;
    this.deathTimer = 0;
    this.animTimer  = 0;

    const diff = CONFIG.DIFFICULTIES[diffKey];

    switch (type) {
      case "walker":
        this.w = 32; this.h = 32; this.hp = 1; this.vx = diff.enemySpeed; break;
      case "shooter":
        this.w = 34; this.h = 36; this.hp = 1; this.vx = 0;
        this.shootTimer    = Math.floor(Math.random() * diff.shootCooldown);
        this.shootCooldown = diff.shootCooldown;
        this.facing = -1;
        break;
      case "charger":
        this.w = 30; this.h = 34; this.hp = 1; this.vx = 0;
        this.speed = diff.enemySpeed * 1.6; this.detected = false;
        break;
      case "big":
        this.w = 50; this.h = 50; this.hp = 2; this.vx = diff.enemySpeed * 0.65; break;
      case "bird":
        // Oiseau volant – largue des bombes (beug il se print tout le temps mais au moins ça, ça fonctionne)
        this.w = 40; this.h = 28; this.hp = 1; this.vx = diff.enemySpeed * 0.9;
        this.shootTimer    = Math.floor(Math.random() * 90);
        this.shootCooldown = 95;
        this.baseY         = y; // altitude fixe
        this.patrolLeft    = x - 180;
        this.patrolRight   = x + 180;
        break;
    }

    this.maxHp = this.hp;

    // Patrol autour du point de spawn si pas de plateforme
    if (!platform && type !== "bird") {
      this.patrolLeft  = x - 110;
      this.patrolRight = x + 110;
    }
  }

  addHp(bonus) {
    this.hp    += bonus;
    this.maxHp += bonus;
  }

  update(player) {
    this.animTimer++;
    if (!this.alive) { this.deathTimer++; return; }
    switch (this.type) {
      case "walker": case "big": this._walk();           break;
      case "shooter":            this._shooter(player);  break;
      case "charger":            this._charger(player);  break;
      case "bird":               this._bird();           break;
    }
  }

  _walk() {
    this.x += this.vx;
    if (this.platform) {
      if (this.x <= this.platform.x)
        { this.x = this.platform.x; this.vx = Math.abs(this.vx); }
      else if (this.x + this.w >= this.platform.x + this.platform.w)
        { this.x = this.platform.x + this.platform.w - this.w; this.vx = -Math.abs(this.vx); }
    } else {
      if (this.x <= this.patrolLeft)                    { this.x = this.patrolLeft; this.vx = Math.abs(this.vx); }
      else if (this.x + this.w >= this.patrolRight)     { this.x = this.patrolRight - this.w; this.vx = -Math.abs(this.vx); }
    }
  }

  _shooter(player) {
    this.facing = player.x > this.x ? 1 : -1;
    this.shootTimer++;
  }

  _charger(player) {
    if (!this.detected && Math.abs(player.x - this.x) < 320) this.detected = true;
    if (!this.detected) return;
    this.vx = player.x > this.x ? this.speed : -this.speed;
    this.x += this.vx;
    const bound = this.platform || { x: this.patrolLeft, w: this.patrolRight - this.patrolLeft };
    this.x = clamp(this.x, bound.x, bound.x + bound.w - this.w);
  }

  _bird() {
    // Vole en patrouille horizontale à altitude fixe
    this.x += this.vx;
    if (this.x <= this.patrolLeft)              { this.vx =  Math.abs(this.vx); }
    if (this.x + this.w >= this.patrolRight)    { this.vx = -Math.abs(this.vx); }
    // Légère oscillation verticale
    this.y = this.baseY + Math.sin(this.animTimer * 0.04) * 8;
    this.shootTimer++;
  }

  shouldShoot() {
    const shootTypes = ["shooter", "bird"];
    return shootTypes.includes(this.type) && this.alive && this.shootTimer >= this.shootCooldown;
  }

  resetShoot() { this.shootTimer = 0; }

  hit() {
    this.hp--;
    if (this.hp <= 0) this.alive = false;
    return !this.alive;
  }
}
