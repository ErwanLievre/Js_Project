# BlazeRun – Niko JUMP 2D

Jeu de plateforme 2D (inspiré de Mario Bros Wii), développé en JavaScript vanilla (HTML5 Canvas).  
Projet B1 – **Niko JUMP 2D** · Équipe : Benjamin Lemoine, Erwan Lièvre, Emilien Pavageau  
Durée : 24h · Deadline : 19 mai 2026

---

## Lancer le jeu

### Sans serveur (mode direct)
Ouvre simplement `index.html` dans Chrome, Firefox ou Edge.

### Avec le serveur local (recommandé)
```bash
npm install   # une seule fois
npm start
```
Puis ouvre [http://localhost:3000](http://localhost:3000).

---

## Contrôles (cahier des charges §3.3)

| Touche(s)              | Action                |
|------------------------|-----------------------|
| `←` / `Q` / `A`        | Déplacement gauche    |
| `→` / `D`              | Déplacement droite    |
| `Espace` / `Z` / `↑`  | Saut                  |
| `S` / `↓`              | Accroupissement       |
| `Échap`                | Pause                 |

> L'accroupissement permet de passer sous les plateformes avec des piques dessous.

---

## Structure du jeu

### 3 Mondes

| # | Nom                 | Mécaniques spéciales                              |
|---|---------------------|---------------------------------------------------|
| 1 | Forêt Enchantée     | Plateformes bois, forêt en parallaxe              |
| 2 | Caverne de Glace    | **Plateformes glissantes**, **piques en dessous** |
| 3 | Monde de Lave       | **Plateformes mobiles**, **lave ralentit**, petites plateformes basses |

### 3 Difficultés

| Difficulté | Vies | Gaps     | Ennemis lava            |
|-----------|------|----------|-------------------------|
| Facile    | 3    | ~80-140  | 1 stomp                 |
| Difficile | 2    | ~130-210 | **2 stomps (lava)**     |
| Impossible| 1    | ~190-290 | **3 stomps (lava)** + Phase 2 gravité inversée |

### Ennemis

- **Marcheur** – patrouille sur plateforme ou au sol
- **Tireur** – tir de projectiles si joueur à <420px
- **Chargeur** – fonce quand il détecte le joueur (320px)
- **Gros** – 2 HP de base (+bonus lava), barre de vie visible

### Power-ups

| Icône  | Effet                |
|--------|----------------------|
| ⭐ Étoile | Invincibilité 5s  |
| ❤️ Vie   | +1 vie            |
| 💰 Pièce | +50 pts           |

---

## Fonctionnalités cahier des charges ✅

- ✅ Platformer 2D défilement horizontal
- ✅ Plateformes + obstacles (piques, chutes, ennemis)
- ✅ Zone d'arrivée (drapeau de fin)
- ✅ Système de gravité réaliste (parabole de saut)
- ✅ Collisions complètes (sol, plateformes, obstacles)
- ✅ Un seul saut à la fois (pas de double saut)
- ✅ Contrôles : ←/→/Espace-Z/S-↓
- ✅ **Accroupissement** (S ou ↓) pour passer sous des passages
- ✅ HTML/CSS/JS vanilla — aucun framework
- ✅ 100 % navigateur, sans serveur
- ✅ Code modulaire (js/core, js/entities, js/game, js/ui)
- ✅ Menu d'accueil, écran game over, écran de victoire

---

## Fonctionnalités bonus (hors CDC de base)

- 🌟 **3 thèmes visuels** avec backgrounds parallaxe (nuages, arbres, aurores, braises)
- 🌟 **Générateur procédural** de niveaux (pas de hard-coding)
- 🌟 **Zone warm-up** : premières plateformes facilement accessibles
- 🌟 **Piques fonctionnels** sous les plateformes de glace (dégâts au contact)
- 🌟 **Glace glissante** : friction réduite sur les plateformes glacées
- 🌟 **Lave ralentit** le joueur dans la zone basse (y > H-140)
- 🌟 **Petites plateformes basses** dans la lave pour remonter
- 🌟 **Ennemis sur le sol** en plus des plateformes
- 🌟 **Ennemis lava multi-HP** (difficile = +1 HP, impossible = +2 HP)
- 🌟 **Phase 2 – Gravité inversée** (lava + impossible uniquement) : même niveau, gravité retournée, remonte au départ
- 🌟 **Checkpoints** (drapeaux) sauvegardant progression, vies et score
- 🌟 **Score** (+100 à +350 pts selon l'ennemi)
- 🌟 **Timer** affiché dans le HUD
- 🌟 **Pause** (Échap) avec menu de reprise
- 🌟 **Sons synthétisés** via Web AudioContext (saut, stomp, power-up, victoire…)
- 🌟 **Particules** à la mort des ennemis (couleur selon le type)
- 🌟 **Leaderboard local** (localStorage) par map + difficulté
- 🌟 **Barre de progression** en bas du canvas
- 🌟 **Joueur retourné** visuellement en phase 2

---

## Architecture technique

```
JS_Project/
├── index.html
├── css/
│   ├── base.css           Variables, reset, body, animations
│   ├── buttons.css        Styles des boutons
│   ├── menu.css           Menu principal
│   ├── levelselect.css    Sélection map + difficulté
│   ├── game.css           Canvas, HUD, pause
│   ├── screens.css        Game Over, Victoire
│   └── leaderboard.css    Classement
└── js/
    ├── config.js          Constantes globales
    ├── core/
    │   ├── helpers.js     rectOverlap, clamp, rand, fmtTime
    │   ├── audio.js       Sons synthétisés (Web AudioContext)
    │   └── particles.js   Système de particules
    ├── entities/
    │   ├── player.js      Joueur (physique, crouch, gravité inversée)
    │   ├── enemy.js       Ennemis (4 types, multi-HP)
    │   ├── enemyDraw.js   Rendu ennemis (prototype extension)
    │   ├── platform.js    Plateformes (4 types, 3 thèmes)
    │   ├── spike.js       Piques (obstacles létaux)
    │   ├── powerup.js     Power-ups (étoile, vie, pièce)
    │   ├── checkpoint.js  Checkpoints
    │   ├── endflag.js     Drapeau de fin
    │   └── projectile.js  Projectiles ennemis
    ├── game/
    │   ├── generator.js   Génération procédurale des niveaux
    │   ├── game.js        Classe principale (boucle, input, lifecycle)
    │   ├── updater.js     Logique de mise à jour + collisions
    │   └── renderer.js    Rendu Canvas + backgrounds
    ├── ui/
    │   ├── hud.js         Fonctions HUD DOM
    │   ├── leaderboard.js Leaderboard localStorage
    │   └── menu.js        Gestion des écrans
    └── main.js            Point d'entrée
```
