class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  }

  _beep(freq, type, duration, vol = 0.22, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {}
  }

  jump()       { this._beep(520, "square", 0.09, 0.2); this._beep(780, "square", 0.07, 0.14, 0.06); }
  stomp()      { this._beep(220, "square", 0.08, 0.3);  this._beep(110, "square", 0.12, 0.2, 0.05); }
  shoot()      { this._beep(800, "sawtooth", 0.05, 0.14); this._beep(400, "sawtooth", 0.07, 0.1, 0.04); }
  die()        { [440, 330, 220, 110].forEach((f, i) => this._beep(f, "sawtooth", 0.14, 0.22, i * 0.1)); }
  powerup()    { [330, 440, 550, 660, 880].forEach((f, i) => this._beep(f, "square", 0.09, 0.18, i * 0.07)); }
  checkpoint() { this._beep(660, "sine", 0.1, 0.2); this._beep(880, "sine", 0.14, 0.24, 0.12); }
  coin()       { this._beep(1046, "square", 0.06, 0.18); this._beep(1318, "square", 0.05, 0.14, 0.05); }
  win()        { [523, 659, 784, 1047, 1318].forEach((f, i) => this._beep(f, "square", 0.17, 0.28, i * 0.14)); }
}
