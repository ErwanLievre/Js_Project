class MenuManager {
  constructor() {
    this.currentGame  = null;
    this.sound        = new SoundManager();
    this.leaderboard  = new Leaderboard();
    this.selectedMap  = 0;
    this.selectedDiff = "easy";

    this.campaign = {
      active:       false,
      diffKey:      "easy",
      currentMap:   0,
      totalScore:   0,
      totalTime:    0,
      savedCp:      null, 
    };

    this._buildMapCards();
    this._bind();
  }

  _buildMapCards() {
    const container = document.getElementById("mapCards");
    if (!container) return;
    container.innerHTML = "";
    const icons = { forest:"🌲", ice:"❄️", lava:"🌋" };
    const hints = { forest:"Bois & forêt dense", ice:"Glissant · Aurores boréales", lava:"Plateformes mobiles" };
    // N'affiche que les maps non-cachées (hidden !== true)
    CONFIG.MAPS.filter(m => !m.hidden).forEach((map, i) => {
      const card = document.createElement("div");
      card.className = "map-card" + (i === 0 ? " selected" : "");
      card.dataset.index = i;
      card.innerHTML = `
        <div class="map-icon">${icons[map.theme]}</div>
        <div class="map-name">${map.name}</div>
        <div class="map-hint">${hints[map.theme]}</div>
      `;
      card.addEventListener("click", () => {
        document.querySelectorAll(".map-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        this.selectedMap = i;
      });
      container.appendChild(card);
    });
  }

  _bind() {
    this._on("btnPlay",       "click", () => this._show("levelSelect"));
    this._on("btnLeaderboard","click", () => { this.leaderboard.render("lbContent"); this._show("leaderboardScreen"); });
    this._on("btnLbBack",     "click", () => this._show("mainMenu"));

    document.querySelectorAll(".diff-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedDiff = btn.dataset.diff;
      });
    });

    this._on("btnStartGame", "click", () => {
      // Lance la campagne depuis la map sélectionnée
      this.campaign = { active:true, diffKey:this.selectedDiff, currentMap:this.selectedMap,
                        totalScore:0, totalTime:0, savedCp:null };
      this._startCampaignMap(this.selectedMap);
    });

    const quit  = () => this._quitToMenu();
    const retry = () => this._retryCurrent();
    [
      ["btnLevelBack",    () => this._show("mainMenu")],
      ["btnResume",       () => this.currentGame?.resume()],
      ["btnPauseQuit",    quit], ["btnRetry",        retry],
      ["btnOverQuit",     quit], ["btnPlayAgain",    retry],
      ["btnWinQuit",      quit], ["btnStopCampaign", quit],
      ["btnContinueNext", () => this._continueToNextMap()],
    ].forEach(([id, fn]) => this._on(id, "click", fn));

    document.querySelector(".diff-btn")?.classList.add("selected");
  }

   _startCampaignMap(mapIndex, options = {}) {
    this.sound.resume();
    if (this.currentGame) { this.currentGame.stop(); this.currentGame = null; }
    this._show("gameScreen");
    document.getElementById("pauseOverlay").classList.add("hidden");

    this.campaign.currentMap = mapIndex;
    const canvas = document.getElementById("gameCanvas");
    this.currentGame = new Game(canvas, mapIndex, this.campaign.diffKey, this.sound, this.leaderboard, options);

    if (options.campaignSavedCp) {
      const cp = options.campaignSavedCp;
      const p  = this.currentGame.player;
      p.cpX = cp.cpX; p.cpY = cp.cpY;
      p.cpLives = cp.cpLives; p.cpScore = cp.cpScore;
      p.respawnAtCheckpoint();
    }

    this.currentGame.onGameOver = (score, timeSec) => {
      setText("overScore", score); setText("overTime", fmtTime(timeSec));
      this._show("gameOverScreen");
    };

    this.currentGame.onWin = (score, timeSec, kills) => {
      this.campaign.totalScore += score;
      this.campaign.totalTime  += timeSec;
      // Sauvegarder le checkpoint courant pour la map suivante
      const p = this.currentGame.player;
      this.campaign.savedCp = { mapIndex, cpX: p.cpX, cpY: p.cpY, cpLives: p.cpLives, cpScore: p.cpScore };

      setText("winScore", this.campaign.totalScore);
      setText("winTime",  fmtTime(this.campaign.totalTime));
      setText("winKills", kills);
      const rec = this.leaderboard.get(mapIndex, this.campaign.diffKey);
      setText("winRecord", rec && rec.score === score ? "🏆 Nouveau record !" : "");

      const nextIdx = mapIndex + 1;
      const nextMap = CONFIG.MAPS[nextIdx];
      const hasNext = nextMap && !nextMap.hidden;

      const div = document.getElementById("campaignContinue");
      if (div) div.classList.toggle("hidden", !hasNext);
      if (hasNext && document.getElementById("nextMapName")) {
        document.getElementById("nextMapName").textContent =
          `Continuer sur "${nextMap.name}" ?`;
      }
      this._show("winScreen");
    };

    this.currentGame.onPhase2 = (score, timeSec) => {
      this.campaign.totalScore += score;
      this.campaign.totalTime  += timeSec;
      this._startCampaignMap(3, {});
    };

    this.currentGame.onNeedPrevMap = (savedCp) => {
      this._startCampaignMap(savedCp.mapIndex, { campaignSavedCp: savedCp });
    };
    this.currentGame.campaignSavedCp = this.campaign.savedCp;

    this.currentGame.start();
  }

  _continueToNextMap() {
    const next = this.campaign.currentMap + 1;
    if (CONFIG.MAPS[next] && !CONFIG.MAPS[next].hidden) {
      this._startCampaignMap(next, {});
    } else {
      this._quitToMenu();
    }
  }

  _retryCurrent() {
    this.campaign.savedCp = null;
    this._startCampaignMap(this.campaign.currentMap, {});
  }

  _quitToMenu() {
    if (this.currentGame) { this.currentGame.stop(); this.currentGame = null; }
    this.campaign = { active:false, diffKey:"easy", currentMap:0, totalScore:0, totalTime:0, savedCp:null };
    this._show("mainMenu");
  }

  _on(id, ev, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  }

  _show(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId)?.classList.add("active");
  }
}
