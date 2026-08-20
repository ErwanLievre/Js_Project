// Niveaux prédéfinis – plateformes fixes pour chaque monde
// platformDefs : {x, y, w, movable}  h toujours 20
// groundSegs   : [[startX, endX]]    trous entre les segments
// wallDefs     : {x, y, h}           murs 18px large (mode Impossible)
// teleporterXs : [x]                 portails sur le sol (doit être dans un groundSeg)
// trampolineXs : [{x, y}]            trampolines
// checkpointXs : [x]                 checkpoints (doit être dans un groundSeg)

const LEVEL_DEFS = {

  // ── FORÊT ENCHANTÉE ────────────────────────────────────────────────
  forest: {
    levelWidth: 6400,
    groundSegs: [[0,1000],[1200,2500],[2700,4100],[4300,6400]],
    platformDefs: [
      {x:220,  y:390, w:320, movable:false},
      {x:640,  y:340, w:290, movable:false},
      {x:1040, y:360, w:260, movable:false},
      {x:1290, y:300, w:380, movable:true },
      {x:1780, y:370, w:280, movable:false},
      {x:2100, y:290, w:350, movable:true },
      {x:2560, y:345, w:270, movable:false},
      {x:2800, y:280, w:360, movable:false},
      {x:3270, y:330, w:290, movable:true },
      {x:3670, y:255, w:320, movable:false},
      {x:4100, y:295, w:310, movable:false},
      {x:4390, y:280, w:360, movable:true },
      {x:4870, y:248, w:300, movable:false},
      {x:5280, y:308, w:330, movable:false},
      {x:5720, y:268, w:290, movable:true },
      {x:6020, y:330, w:280, movable:false},
    ],
    wallDefs: [
      {x:1680, y:200, h:220},
      {x:3130, y:180, h:240},
      {x:5090, y:200, h:220},
    ],
    // Vérifiés dans groundSegs : 1900 ∈ [1200,2500] ✓  4000 ∈ [2700,4100] ✓
    teleporterXs: [1900, 4000],
    trampolineXs: [
      {x:310,  y:370},
      {x:1965, y:270},
      {x:3760, y:235},
      {x:5820, y:248},
    ],
    // 2100 ∈ [1200,2500] ✓  4400 ∈ [4300,6400] ✓
    checkpointXs: [2100, 4400],
  },

  // ── CAVERNE DE GLACE ───────────────────────────────────────────────
  ice: {
    levelWidth: 6800,
    groundSegs: [[0,750],[1100,2200],[2600,3700],[4100,5200],[5700,6800]],
    platformDefs: [
      {x:220,  y:385, w:340, movable:false},
      {x:680,  y:325, w:310, movable:true },
      {x:1180, y:355, w:360, movable:false},
      {x:1650, y:290, w:320, movable:true },
      {x:2060, y:345, w:290, movable:false},
      {x:2680, y:300, w:380, movable:false},
      {x:3150, y:258, w:330, movable:true },
      {x:3570, y:315, w:300, movable:false},
      {x:4180, y:278, w:360, movable:false},
      {x:4650, y:243, w:310, movable:true },
      {x:5060, y:300, w:320, movable:false},
      {x:5780, y:268, w:350, movable:true },
      {x:6240, y:315, w:260, movable:false},
    ],
    wallDefs: [
      {x:1480, y:160, h:260},
      {x:3410, y:160, h:260},
      {x:5440, y:160, h:260},
    ],
    // 1500 ∈ [1100,2200] ✓  4500 ∈ [4100,5200] ✓
    teleporterXs: [1500, 4500],
    trampolineXs: [
      {x:310,  y:365},
      {x:1780, y:270},
      {x:3660, y:295},
      {x:5870, y:248},
    ],
    // 1800 ∈ [1100,2200] ✓  4200 ∈ [4100,5200] ✓
    checkpointXs: [1800, 4200],
  },

  // ── MONDE DE LAVE ──────────────────────────────────────────────────
  lava: {
    levelWidth: 7200,
    groundSegs: [[0,650],[1050,1900],[2400,3200],[3700,4600],[5100,5900],[6400,7200]],
    platformDefs: [
      {x:220,  y:385, w:350, movable:false},
      {x:700,  y:325, w:300, movable:true },
      {x:1120, y:355, w:360, movable:false},
      {x:1590, y:283, w:330, movable:true },
      {x:2050, y:345, w:300, movable:false},
      {x:2480, y:293, w:380, movable:true },
      {x:2970, y:253, w:320, movable:false},
      {x:3380, y:308, w:295, movable:false},
      {x:3780, y:268, w:360, movable:true },
      {x:4280, y:238, w:310, movable:false},
      {x:4730, y:298, w:335, movable:true },
      {x:5180, y:258, w:300, movable:false},
      {x:5660, y:283, w:355, movable:true },
      {x:6090, y:300, w:285, movable:false},
      {x:6490, y:345, w:280, movable:false},
    ],
    wallDefs: [
      {x:1950, y:100, h:290},
      {x:3890, y:100, h:290},
      {x:5820, y:100, h:290},
    ],
    // 2700 ∈ [2400,3200] ✓  4300 ∈ [3700,4600] ✓  (lave = recule)
    teleporterXs: [2700, 4300],
    trampolineXs: [
      {x:310,  y:365},
      {x:1700, y:263},
      {x:3870, y:248},
      {x:5760, y:263},
    ],
    // 2600 ∈ [2400,3200] ✓  4400 ∈ [3700,4600] ✓
    checkpointXs: [2600, 4400],
  },

  // ── PHASE 2 – GRAVITÉ INVERSÉE (carte cachée, accessible depuis la lave) ──
  // Gravité inversée : le joueur colle au PLAFOND et avance vers la GAUCHE
  phase2: {
    levelWidth: 4500,
    // Pas de sol normal – le "sol" est le plafond ajouté par le générateur (y=-40)
    groundSegs: [],
    // Plateformes suspendues : le joueur marche sur leur DESSOUS (plat.y + plat.h)
    // Positionnées à y=60-150 pour être accessibles depuis le plafond (~150px de saut)
    platformDefs: [
      {x:4000, y:70,  w:280, movable:false},
      {x:3600, y:100, w:260, movable:true },
      {x:3200, y:80,  w:300, movable:false},
      {x:2800, y:110, w:270, movable:true },
      {x:2400, y:90,  w:310, movable:false},
      {x:2000, y:120, w:280, movable:true },
      {x:1600, y:85,  w:300, movable:false},
      {x:1200, y:105, w:260, movable:false},
      {x:800,  y:95,  w:290, movable:true },
      {x:400,  y:115, w:270, movable:false},
    ],
    wallDefs:     [],
    teleporterXs: [],
    trampolineXs: [],
    // checkpoints au plafond (y=0 = dessous du plafond)
    checkpointXs: [3000, 1500],
  },
};
