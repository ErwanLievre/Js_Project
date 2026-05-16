const CONFIG = {
  CANVAS_WIDTH:  800,
  CANVAS_HEIGHT: 500,
  GRAVITY:       0.55,
  PLAYER_SPEED:  4.5,
  JUMP_FORCE:    -13,

  MAPS: [
    {
      id: 0, name: "Forêt Enchantée", theme: "forest",
      bgColors: ["#87CEEB","#B0E0E6"], slippery: false, hidden: false,
    },
    {
      id: 1, name: "Caverne de Glace", theme: "ice",
      bgColors: ["#0D1B2A","#1B2E4A"], slippery: true, hidden: false,
    },
    {
      id: 2, name: "Monde de Lave", theme: "lava",
      bgColors: ["#1A0000","#3D0000"], slippery: false, hidden: false,
    },
    // Carte cachée – accessible uniquement après avoir fini la lave
    {
      id: 3, name: "Retour aux Sources", theme: "phase2",
      bgColors: ["#2D0000","#1A0000"], slippery: false, hidden: true,
    },
  ],

  DIFFICULTIES: {
    easy: {
      name: "Facile", color: "#22c55e",
      lives: 3,
      enemyMult:       0.6,
      groundEnemyMult: 0.5,
      hasShooters: false, hasChargers: false, hasBig: false,
      enemySpeed:      1.2,
      shootCooldown:   150,
      maxPerPlatform:  1,
      lavaHpBonus:     0,
    },
    medium: {
      name: "Difficile", color: "#f59e0b",
      lives: 2,
      enemyMult:       0.9,
      groundEnemyMult: 0.8,
      hasShooters: true, hasChargers: false, hasBig: false,
      enemySpeed:      2.0,
      shootCooldown:   90,
      maxPerPlatform:  2,
      lavaHpBonus:     1,
    },
    hard: {
      name: "Impossible", color: "#ef4444",
      lives: 1,
      enemyMult:       1.3,
      groundEnemyMult: 1.1,
      hasShooters: true, hasChargers: true, hasBig: true,
      enemySpeed:      3.0,
      shootCooldown:   55,
      maxPerPlatform:  2,
      lavaHpBonus:     2,
    },
  },
};
