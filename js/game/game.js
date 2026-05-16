class Game {
  constructor(canvas, mapIndex, diffKey, sound, leaderboard, options = {}) {
    this.canvas      = canvas;
    this.ctx         = canvas.getContext("2d");
    this.map         = CONFIG.MAPS[mapIndex];
    this.mapIndex    = mapIndex;
    this.diffKey     = diffKey;
    this.diff        = CONFIG.DIFFICULTIES[diffKey] || CONFIG.DIFFICULTIES.hard;
    this.sound       = sound;
    this.leaderboard = leaderboard;

    this.state       = "playing";
    // Phase 2 (gravité inversée) = carte dédiée, pas une transformation en cours de jeu
    this.gravityMult = (this.map.theme === "phase2") ? -1 : 1;
    this.startTime   = Date.now();
    this.elapsedSec  = 0;

    this.keys = { left: false, right: false, jump: false, crouch: false };
    this._jumpConsumed = false;

    // Timestep fixe pour avoir la même vitesse sur tous les PC
    this._acc    = 0;
    this._lastTs = 0;

    this.particles   = new ParticleSystem();
    this.projectiles = [];
    this._cpMsg      = 0;

    const level        = generateLevel(this.map, this.diffKey);
    this.platforms     = level.platforms;
    this.enemies       = level.enemies;
    this.powerups      = level.powerups;
    this.checkpoints   = level.checkpoints;
    this.spikes        = level.spikes;
    this.trampolines   = level.trampolines;
    this.teleporters   = level.teleporters;
    this.endFlag       = level.endFlag;
    this.levelWidth    = level.levelWidth;

    const groundY = CONFIG.CANVAS_HEIGHT - 40;
    // Phase2 : le joueur commence en haut à droite et tombe VERS le plafond (gravité inversée)
    const startX = this.map.theme === "phase2" ? this.levelWidth - 200 : 100;
    const startY = this.map.theme === "phase2" ? 300 : groundY - 48; // phase2 : tombe vers y=0
    this.player   = new Player(startX, startY, this.diff.lives);
    this.cameraX  = this.map.theme === "phase2" ? Math.max(0, this.levelWidth - CONFIG.CANVAS_WIDTH) : 0;

    // Checkpoint de campagne (vient de la map précédente si on en a pas sur celle-ci)
    this.campaignSavedCp = options.campaignSavedCp || null;

    // Callbacks (remplis par menu.js)
    this.onGameOver    = null;
    this.onWin         = null;
    this.onPhase2      = null; // appelé quand le joueur finit la lave
    this.onNeedPrevMap = null; // appelé quand le joueur n'a aucun checkpoint local

    this.rafId = null;
    this._bindInput();
  }

  _bindInput() {
    const prevent = ["ArrowUp","KeyW","Space","ArrowLeft","ArrowRight","KeyA","KeyD",
                     "ArrowDown","KeyS","KeyQ","KeyZ"];
    this._onKeyDown = (e) => {
      if (prevent.includes(e.code)) e.preventDefault();
      switch (e.code) {
        case "ArrowLeft":  case "KeyA": case "KeyQ": this.keys.left  = true;  break;
        case "ArrowRight": case "KeyD":              this.keys.right = true;  break;
        case "ArrowUp": case "KeyW": case "Space": case "KeyZ":
          if (!this._jumpConsumed) { this.keys.jump = true; this._jumpConsumed = true; }
          break;
        case "ArrowDown": case "KeyS": this.keys.crouch = true;  break;
        case "Escape":
          if (this.state === "playing") this.pause();
          else if (this.state === "paused") this.resume();
          break;
      }
    };
    this._onKeyUp = (e) => {
      switch (e.code) {
        case "ArrowLeft":  case "KeyA": case "KeyQ": this.keys.left  = false; break;
        case "ArrowRight": case "KeyD":              this.keys.right = false; break;
        case "ArrowUp": case "KeyW": case "Space": case "KeyZ":
          this.keys.jump = false; this._jumpConsumed = false; break;
        case "ArrowDown": case "KeyS": this.keys.crouch = false; break;
      }
    };
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup",   this._onKeyUp);
  }

  // Retourne true si le joueur a pris au moins un checkpoint dans ce niveau
  hasLocalCheckpoint() {
    const startX = this.map.theme === "phase2" ? this.levelWidth - 200 : 100;
    return this.player.cpX !== startX;
  }

  start()  { this.rafId = requestAnimationFrame(this._loop.bind(this)); }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup",   this._onKeyUp);
  }

  pause() {
    this.state = "paused";
    document.getElementById("pauseOverlay").classList.remove("hidden");
  }

  resume() {
    this.state = "playing";
    document.getElementById("pauseOverlay").classList.add("hidden");
  }

  _loop(ts = 0) {
    // Timestep fixe 60Hz – garantit la même vitesse sur tous les PC
    if (!this._lastTs) this._lastTs = ts;
    const elapsed = Math.min(ts - this._lastTs, 50);
    this._lastTs  = ts;
    this._acc    += elapsed;

    const step = 1000 / 60;
    while (this._acc >= step) {
      if (this.state === "playing") {
        this.elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
        this._update();
        this.keys.jump = false;
      }
      this._acc -= step;
    }

    this._draw();
    if (this.state !== "gameover" && this.state !== "win") {
      this.rafId = requestAnimationFrame(this._loop.bind(this));
    }
  }
}

