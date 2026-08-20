class Leaderboard {
  constructor() {
    this._key  = "blazerun_lb_v1";
    this._data = JSON.parse(localStorage.getItem(this._key) || "{}");
  }

  save(mapId, diff, score, timeSec) {
    const key  = `${mapId}_${diff}`;
    const prev = this._data[key];
    if (!prev || score > prev.score) {
      this._data[key] = { score, timeSec, date: new Date().toLocaleDateString("fr-FR") };
      localStorage.setItem(this._key, JSON.stringify(this._data));
      return true;
    }
    return false;
  }

  get(mapId, diff) { return this._data[`${mapId}_${diff}`] || null; }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    let hasData = false;
    CONFIG.MAPS.forEach(map => {
      Object.keys(CONFIG.DIFFICULTIES).forEach(diff => {
        const rec = this.get(map.id, diff);
        if (!rec) return;
        hasData = true;
        const d   = CONFIG.DIFFICULTIES[diff];
        const row = document.createElement("div");
        row.className = "lb-row";
        row.innerHTML = `
          <span class="lb-map">${map.name}</span>
          <span class="lb-diff" style="color:${d.color}">${d.name}</span>
          <span class="lb-score">${rec.score} pts</span>
          <span class="lb-time">${fmtTime(rec.timeSec)}</span>
          <span class="lb-date">${rec.date}</span>
        `;
        container.appendChild(row);
      });
    });

    if (!hasData) {
      container.innerHTML = '<p class="lb-empty">Aucun record pour l\'instant.<br>Jouez une partie !</p>';
    }
  }
}
