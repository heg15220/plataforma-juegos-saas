import { createLevel } from "./schema";

const hints = (es, en) => ({ es: Array.isArray(es) ? es : [es], en: Array.isArray(en) ? en : [en] });

const level = (index, config) =>
  createLevel({
    index,
    world: "neon-foundry",
    theme: "neon-foundry",
    musicId: "world1-loop",
    ...config,
  });

export const WORLD1_LEVELS = [
  level(0, {
    id: "flux-01",
    name: { es: "Calibracion", en: "Calibration" },
    taxonomy: "direct",
    difficultyBand: "teach",
    backgroundId: "neon-grid",
    ballSpawn: { x: 132, y: 430, aimDeg: -38, power: 0.91 },
    target: { x: 724, y: 316 },
    obstacles: [],
    starRules: { parTimeMs: 4200, parBounces: 1 },
    tutorialHints: hints(
      "Arrastra desde la orbita y suelta. Mantener la trayectoria limpia da 3 estrellas.",
      "Drag from the orb and release. Keeping the line clean earns 3 stars."
    ),
  }),
  level(1, {
    id: "flux-02",
    name: { es: "Caida Guiada", en: "Guided Drop" },
    taxonomy: "direct",
    difficultyBand: "teach",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 154, y: 410, aimDeg: -39, power: 0.97 },
    target: { x: 764, y: 154 },
    obstacles: [{ type: "wall", x: 642, y: 270, w: 132, h: 18, tint: "#5a6c92" }],
    starRules: { parTimeMs: 5200, parBounces: 1 },
    tutorialHints: hints(
      "El objetivo no siempre esta a la misma altura. Lee la gravedad antes de tirar.",
      "The basin will not always sit at the same height. Read gravity before releasing."
    ),
  }),
  level(2, {
    id: "flux-03",
    name: { es: "Eco de Goma", en: "Rubber Echo" },
    taxonomy: "one-bounce",
    difficultyBand: "teach",
    backgroundId: "prism-bay",
    ballSpawn: { x: 148, y: 426, aimDeg: -61, power: 0.64 },
    target: { x: 810, y: 190 },
    obstacles: [{ type: "bumper", x: 430, y: 326, radius: 38 }],
    starRules: { parTimeMs: 6200, parBounces: 2 },
    tutorialHints: hints(
      "El bumper devuelve mas energia. Busca un rebote controlado, no potencia bruta.",
      "The bumper returns extra energy. Look for a controlled bank, not brute force."
    ),
  }),
  level(3, {
    id: "flux-04",
    name: { es: "Plano Inclinado", en: "Inclined Plane" },
    taxonomy: "controlled-drop",
    difficultyBand: "teach",
    backgroundId: "neon-grid",
    ballSpawn: { x: 136, y: 418, aimDeg: -46, power: 0.58 },
    target: { x: 786, y: 170 },
    obstacles: [{ type: "ramp", x1: 446, y1: 354, x2: 592, y2: 260, thickness: 18 }],
    starRules: { parTimeMs: 6600, parBounces: 2 },
    tutorialHints: hints(
      "Las rampas convierten caida en direccion. Llega suave para no salir despedido.",
      "Ramps convert fall into direction. Arrive soft so the orb does not kick away."
    ),
  }),
  level(4, {
    id: "flux-05",
    name: { es: "Foso Vivo", en: "Live Pit" },
    taxonomy: "risk-reward",
    difficultyBand: "reinforce",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 134, y: 430, aimDeg: -38, power: 0.57 },
    target: { x: 816, y: 182 },
    obstacles: [
      { type: "spikeStrip", x: 512, y: 500, w: 196, h: 24 },
      { type: "wall", x: 516, y: 308, w: 126, h: 20 },
    ],
    starRules: { parTimeMs: 7600, parBounces: 2 },
    tutorialHints: hints(
      "Los hazards exigen una lectura clara: poco por debajo es fallo, demasiado arriba tambien.",
      "Hazards demand clean reads: too low fails, too high does too."
    ),
  }),
  level(5, {
    id: "flux-06",
    name: { es: "Rail de Timing", en: "Timing Rail" },
    taxonomy: "timing",
    difficultyBand: "reinforce",
    backgroundId: "prism-bay",
    ballSpawn: { x: 138, y: 432, aimDeg: -61, power: 0.85 },
    target: { x: 814, y: 164 },
    obstacles: [
      {
        type: "movingBar",
        x: 482,
        y: 278,
        w: 126,
        h: 18,
        movement: { axis: "y", min: 166, max: 384, speed: 108, phase: 0.1 },
      },
    ],
    starRules: { parTimeMs: 7800, parBounces: 2 },
    tutorialHints: hints(
      "Observa un ciclo antes de tirar. El mejor disparo a veces es esperar medio segundo.",
      "Watch one cycle before committing. The best shot sometimes waits half a second."
    ),
  }),
  level(6, {
    id: "flux-07",
    name: { es: "Bolsa de Aire", en: "Air Pocket" },
    taxonomy: "controlled-drop",
    difficultyBand: "reinforce",
    backgroundId: "neon-grid",
    ballSpawn: { x: 132, y: 438, aimDeg: -24, power: 0.46 },
    target: { x: 824, y: 154 },
    obstacles: [
      { type: "fan", x: 488, y: 262, w: 164, h: 182, forceX: 42, forceY: -1180 },
      { type: "wall", x: 648, y: 376, w: 124, h: 18 },
    ],
    starRules: { parTimeMs: 8800, parBounces: 2 },
    tutorialHints: hints(
      "El ventilador sostiene la orbita. Entra en su volumen con angulo medio.",
      "The fan holds the orb up. Enter its volume on a medium angle."
    ),
  }),
  level(7, {
    id: "flux-08",
    name: { es: "Gel de Frenado", en: "Brake Gel" },
    taxonomy: "precision",
    difficultyBand: "reinforce",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 146, y: 418, aimDeg: -34, power: 0.55 },
    target: { x: 792, y: 150 },
    obstacles: [
      { type: "stickyPad", x: 620, y: 268, w: 146, h: 24 },
      { type: "wall", x: 458, y: 332, w: 128, h: 20 },
    ],
    starRules: { parTimeMs: 9200, parBounces: 3 },
    tutorialHints: hints(
      "El pad gel reduce el exceso de velocidad. Es una ayuda si lo rozas con control.",
      "The gel pad trims excess speed. It helps if you brush it with control."
    ),
  }),
  level(8, {
    id: "flux-09",
    name: { es: "Doble Eco", en: "Double Echo" },
    taxonomy: "two-bounce",
    difficultyBand: "combine",
    backgroundId: "prism-bay",
    ballSpawn: { x: 134, y: 428, aimDeg: -20, power: 0.44 },
    target: { x: 832, y: 162 },
    obstacles: [
      { type: "bumper", x: 332, y: 340, radius: 34 },
      { type: "bumper", x: 612, y: 222, radius: 36 },
    ],
    starRules: { parTimeMs: 9800, parBounces: 3 },
    tutorialHints: hints(
      "Secuencia: primer bumper para altura, segundo para correccion final.",
      "Sequence it: first bumper for height, second one for the final correction."
    ),
  }),
  level(9, {
    id: "flux-10",
    name: { es: "Flor Gravitatoria", en: "Gravity Bloom" },
    taxonomy: "puzzle-physics",
    difficultyBand: "combine",
    backgroundId: "neon-grid",
    ballSpawn: { x: 142, y: 430, aimDeg: -32, power: 0.49 },
    target: { x: 800, y: 170 },
    obstacles: [
      { type: "gravityWell", x: 512, y: 252, radius: 102, strength: 96000 },
      { type: "wall", x: 698, y: 322, w: 138, h: 18 },
    ],
    physicsProfile: { gravity: 860, drag: 0.012 },
    starRules: { parTimeMs: 10200, parBounces: 3 },
    tutorialHints: hints(
      "El campo no es decorativo: roba trayectoria. Apunta un poco abierto y deja que curve.",
      "The field is not decorative: it steals trajectory. Aim a little wider and let it bend."
    ),
  }),
  level(10, {
    id: "flux-11",
    name: { es: "Pliegue Portal", en: "Portal Fold" },
    taxonomy: "puzzle-physics",
    difficultyBand: "combine",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 148, y: 432, aimDeg: -28, power: 0.47 },
    target: { x: 812, y: 146 },
    obstacles: [
      { type: "portal", x: 384, y: 374, radius: 28, pairId: "A" },
      { type: "portal", x: 676, y: 196, radius: 28, pairId: "A" },
      { type: "wall", x: 548, y: 288, w: 126, h: 18 },
    ],
    physicsProfile: { gravity: 880 },
    starRules: { parTimeMs: 9600, parBounces: 2 },
    tutorialHints: hints(
      "Los portales conservan impulso. Entra alineado con la salida que quieres aprovechar.",
      "Portals keep momentum. Enter aligned with the exit you want to use."
    ),
  }),
  level(11, {
    id: "flux-12",
    name: { es: "Compuerta Pulso", en: "Pulse Gate" },
    taxonomy: "timing",
    difficultyBand: "combine",
    backgroundId: "prism-bay",
    ballSpawn: { x: 138, y: 434, aimDeg: -38, power: 0.61 },
    target: { x: 804, y: 150 },
    obstacles: [
      { type: "gate", x: 512, y: 248, w: 26, h: 208, periodMs: 2200, openMs: 980, phaseMs: 420 },
      { type: "wall", x: 668, y: 334, w: 136, h: 18 },
    ],
    starRules: { parTimeMs: 9800, parBounces: 2 },
    tutorialHints: hints(
      "Ventana corta: carga el tiro antes de que se abra para no perder el ritmo.",
      "Short window: charge before it opens so you do not miss the rhythm."
    ),
  }),
  level(12, {
    id: "flux-13",
    name: { es: "Capsula Nomada", en: "Nomad Capsule" },
    taxonomy: "timing",
    difficultyBand: "combine",
    backgroundId: "neon-grid",
    ballSpawn: { x: 142, y: 426, aimDeg: -40, power: 0.58 },
    target: {
      x: 786,
      y: 166,
      moving: { axis: "x", min: 700, max: 840, speed: 78, phase: 0.15 },
    },
    obstacles: [
      { type: "ramp", x1: 462, y1: 356, x2: 632, y2: 264, thickness: 18 },
      { type: "spikeStrip", x: 446, y: 500, w: 148, h: 24 },
    ],
    starRules: { parTimeMs: 9800, parBounces: 2 },
    tutorialHints: hints(
      "Ahora el objetivo se desplaza. Lanza al espacio donde va a estar, no donde esta.",
      "The target now moves. Launch to where it will be, not where it is."
    ),
  }),
  level(13, {
    id: "flux-14",
    name: { es: "Linea de Corriente", en: "Current Line" },
    taxonomy: "speed-clear",
    difficultyBand: "combine",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 132, y: 438, aimDeg: -22, power: 0.44 },
    target: { x: 820, y: 178 },
    obstacles: [
      { type: "fan", x: 358, y: 246, w: 132, h: 164, forceX: 220, forceY: -760 },
      {
        type: "movingBar",
        x: 604,
        y: 230,
        w: 122,
        h: 18,
        movement: { axis: "x", min: 534, max: 712, speed: 96, phase: 0.45 },
      },
      { type: "spikeStrip", x: 602, y: 500, w: 176, h: 24 },
    ],
    starRules: { parTimeMs: 8700, parBounces: 2 },
    tutorialHints: hints(
      "El ventilador no solo eleva: tambien acelera. Usa el empuje lateral para pasar el rail.",
      "The fan does not only lift: it accelerates. Use the lateral push to clear the rail."
    ),
  }),
  level(14, {
    id: "flux-15",
    name: { es: "Tejido Espejo", en: "Mirror Weave" },
    taxonomy: "anti-habit",
    difficultyBand: "wow",
    backgroundId: "prism-bay",
    ballSpawn: { x: 822, y: 420, aimDeg: -146, power: 0.56 },
    target: { x: 168, y: 162 },
    obstacles: [
      { type: "portal", x: 646, y: 332, radius: 28, pairId: "B" },
      { type: "portal", x: 340, y: 212, radius: 28, pairId: "B" },
      { type: "bumper", x: 500, y: 288, radius: 36 },
      { type: "wall", x: 512, y: 430, w: 152, h: 18 },
    ],
    starRules: { parTimeMs: 10400, parBounces: 3 },
    tutorialHints: hints(
      "Anti-habito: el disparo sale desde la derecha. Rompe el automatismo y lee la escena completa.",
      "Anti-habit level: the shot starts on the right. Break your routine and read the whole scene."
    ),
  }),
  level(15, {
    id: "flux-16",
    name: { es: "Terciopelo Orbital", en: "Orbital Velvet" },
    taxonomy: "precision",
    difficultyBand: "wow",
    backgroundId: "neon-grid",
    ballSpawn: { x: 142, y: 428, aimDeg: -30, power: 0.5 },
    target: { x: 810, y: 142, innerW: 50, tolerance: 12 },
    obstacles: [
      { type: "stickyPad", x: 414, y: 246, w: 156, h: 24 },
      { type: "gravityWell", x: 640, y: 214, radius: 82, strength: 72000 },
      { type: "spikeStrip", x: 520, y: 500, w: 236, h: 24 },
    ],
    physicsProfile: { gravity: 880, drag: 0.013 },
    starRules: { parTimeMs: 11600, parBounces: 3 },
    tutorialHints: hints(
      "El gel quita velocidad y el campo la curva. La solucion nace de combinar ambos.",
      "The gel strips speed and the field bends the path. The solution comes from using both."
    ),
  }),
  level(16, {
    id: "flux-17",
    name: { es: "Ritmo de Taller", en: "Workshop Rhythm" },
    taxonomy: "timing",
    difficultyBand: "wow",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 138, y: 430, aimDeg: -40, power: 0.58 },
    target: {
      x: 806,
      y: 154,
      moving: { axis: "y", min: 136, max: 214, speed: 72, phase: 0.35 },
    },
    obstacles: [
      {
        type: "movingBar",
        x: 332,
        y: 360,
        w: 118,
        h: 18,
        movement: { axis: "y", min: 232, max: 414, speed: 124, phase: 0.2 },
      },
      { type: "gate", x: 566, y: 224, w: 24, h: 192, periodMs: 2100, openMs: 1040, phaseMs: 160 },
      { type: "wall", x: 704, y: 330, w: 132, h: 18 },
    ],
    starRules: { parTimeMs: 11400, parBounces: 3 },
    tutorialHints: hints(
      "No busques reflejos puros: sincroniza dos ritmos y un objetivo movil.",
      "Do not rely on reflex alone: synchronize two rhythms and a moving target."
    ),
  }),
  level(17, {
    id: "flux-18",
    name: { es: "Labor de Precision", en: "Precision Lab" },
    taxonomy: "precision",
    difficultyBand: "challenge",
    backgroundId: "prism-bay",
    ballSpawn: { x: 150, y: 432, aimDeg: -26, power: 0.48 },
    target: { x: 830, y: 190, innerW: 46, tolerance: 10 },
    obstacles: [
      { type: "wall", x: 398, y: 182, w: 126, h: 18 },
      { type: "wall", x: 398, y: 388, w: 126, h: 18 },
      { type: "bumper", x: 594, y: 284, radius: 32 },
      { type: "spikeStrip", x: 596, y: 500, w: 206, h: 24 },
    ],
    starRules: { parTimeMs: 9300, parBounces: 2 },
    tutorialHints: hints(
      "El pasillo central invita a disparar recto, pero la respuesta es un bank limpio.",
      "The center lane tempts a straight throw, but the answer is a clean bank."
    ),
  }),
  level(18, {
    id: "flux-19",
    name: { es: "Hilatura del Cielo", en: "Sky Thread" },
    taxonomy: "wow",
    difficultyBand: "challenge",
    backgroundId: "neon-grid",
    ballSpawn: { x: 124, y: 138, aimDeg: -12, power: 0.44 },
    target: {
      x: 798,
      y: 402,
      moving: { axis: "x", min: 712, max: 842, speed: 68, phase: 0.55 },
    },
    obstacles: [
      { type: "portal", x: 286, y: 164, radius: 28, pairId: "C" },
      { type: "portal", x: 686, y: 350, radius: 28, pairId: "C" },
      { type: "fan", x: 498, y: 160, w: 144, h: 160, forceX: 80, forceY: 980 },
      { type: "wall", x: 520, y: 438, w: 132, h: 18 },
      { type: "spikeStrip", x: 224, y: 500, w: 148, h: 24 },
    ],
    physicsProfile: { gravity: 930 },
    starRules: { parTimeMs: 12600, parBounces: 3 },
    tutorialHints: hints(
      "Wow level: caida, portal y objetivo movil en una sola lectura.",
      "Wow level: drop, portal and moving goal in one single read."
    ),
  }),
  level(19, {
    id: "flux-20",
    name: { es: "Corona de Fundicion", en: "Foundry Crown" },
    taxonomy: "puzzle-physics",
    difficultyBand: "boss",
    backgroundId: "alloy-dawn",
    ballSpawn: { x: 130, y: 432, aimDeg: -38, power: 0.6 },
    target: {
      x: 818,
      y: 132,
      innerW: 50,
      tolerance: 10,
      moving: { axis: "x", min: 770, max: 848, speed: 62, phase: 0.1 },
    },
    obstacles: [
      {
        type: "movingBar",
        x: 286,
        y: 396,
        w: 110,
        h: 18,
        movement: { axis: "y", min: 236, max: 430, speed: 136, phase: 0.25 },
      },
      { type: "bumper", x: 432, y: 228, radius: 36 },
      { type: "gate", x: 566, y: 218, w: 24, h: 204, periodMs: 2300, openMs: 1080, phaseMs: 640 },
      { type: "gravityWell", x: 676, y: 256, radius: 88, strength: 82000 },
      { type: "stickyPad", x: 784, y: 280, w: 120, h: 24 },
      { type: "spikeStrip", x: 516, y: 500, w: 246, h: 24 },
    ],
    physicsProfile: { gravity: 920, restitution: 0.8, drag: 0.012 },
    starRules: { parTimeMs: 13800, parBounces: 4 },
    tutorialHints: hints(
      [
        "Todo lo aprendido entra aqui: timing, rebote, lectura de campos y control de velocidad.",
        "La solucion existe y es justa. Si fallas, el motivo esta en pantalla.",
      ],
      [
        "Everything learned appears here: timing, bounce, field reads and speed control.",
        "The solution exists and it is fair. If you miss, the reason is visible on screen.",
      ]
    ),
  }),
];
