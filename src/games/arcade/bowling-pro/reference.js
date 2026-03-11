export const RULE_STATUS = {
  simulated: { es: "Simulada", en: "Simulated" },
  partial: { es: "Parcial", en: "Partial" },
  documented: { es: "Documentada", en: "Documented" },
};

export const ASSET_REFERENCE = {
  name: "03-Bowling-Assets-Original",
  source: "Complete Blender Creator / EmbraceIT Ltd",
  repoUrl: "https://github.com/CompleteBlenderCreator/03-Bowling-Assets-Original",
  license: "MIT",
  files: [
    {
      name: "Bowling Alley.blend",
      size: "1.29 MB",
      role: {
        es: "Escena base del alley con composicion de pista y entorno.",
        en: "Base alley scene with lane and environment composition.",
      },
    },
    {
      name: "Bowling Alley Fun With Physics.blend",
      size: "6.03 MB",
      role: {
        es: "Escena de alley con pruebas de impacto y fisicas sobre pin/bola.",
        en: "Alley scene for impact and physics experiments with the pin and ball.",
      },
    },
    {
      name: "Bowling Ball.blend",
      size: "537 KB",
      role: {
        es: "Malla de bola oscura y brillante usada como referencia visual del lanzamiento.",
        en: "Dark glossy bowling ball mesh used as visual throwing reference.",
      },
    },
    {
      name: "BowlingPin.blend",
      size: "529 KB",
      role: {
        es: "Modelo principal del bolo con silueta clasica de cuello y panza ancha.",
        en: "Primary pin model with classic narrow-neck / wide-belly silhouette.",
      },
    },
    {
      name: "BowlingPinCollider.blend",
      size: "450 KB",
      role: {
        es: "Collider simplificado que inspira la logica ligera de contacto y carry.",
        en: "Simplified collider that inspires the lightweight contact and carry model.",
      },
    },
    {
      name: "PinReference.png",
      size: "2000x6375",
      role: {
        es: "Referencia vertical del perfil del bolo para dibujar su forma en canvas.",
        en: "Tall pin profile reference used to draw the canvas silhouette.",
      },
    },
    {
      name: "Unity Project (optional)/Assets/Pin.unity",
      size: "Scene",
      role: {
        es: "Escena opcional que confirma un uso simple de pin + collider + materiales.",
        en: "Optional scene confirming a simple setup with pin + collider + materials.",
      },
    },
  ],
  materials: [
    {
      name: "Pin",
      swatch: "#f2ece4",
      role: {
        es: "Cuerpo del bolo en marfil calido.",
        en: "Warm ivory pin body.",
      },
    },
    {
      name: "Stripe",
      swatch: "#a61f2d",
      role: {
        es: "Banda roja del cuello del bolo.",
        en: "Red neck stripe on the pin.",
      },
    },
    {
      name: "unnamed",
      swatch: "#8b96a3",
      role: {
        es: "Material auxiliar neutro usado como referencia gris/metal.",
        en: "Neutral helper material used as a gray / metal reference.",
      },
    },
  ],
  environmentCues: [
    {
      es: "Par de pistas contiguas, foul line clara, deck final y lectura de broadcast desde la cabecera.",
      en: "Two adjacent lanes, visible foul line, rear pin deck, and a broadcast-style read from the head area.",
    },
    {
      es: "Superficie de madera barnizada con tablas visibles y gutters oscuros a ambos lados.",
      en: "Varnished wood lane surface with visible boards and dark gutters on both sides.",
    },
    {
      es: "Bolos blancos con banda roja y bola negra brillante como lectura dominante del pack.",
      en: "White pins with a red stripe and a glossy dark ball as the pack's dominant read.",
    },
    {
      es: "Escena de fisicas sencilla: pinfall legible y colisiones faciles de prototipar.",
      en: "Simple physics scene: readable pinfall and collisions that are easy to prototype.",
    },
  ],
  implementationNotes: [
    {
      es: "La app no importa los .blend directamente; reinterpreta el alley en 2D canvas con perspectiva, gutters, kickbacks, deck y approach.",
      en: "The app does not import the .blend files directly; it reinterprets the alley in 2D canvas with perspective, gutters, kickbacks, deck, and approach.",
    },
    {
      es: "El modelo del bolo se dibuja con una silueta inspirada en PinReference.png y en BowlingPin.blend en vez de un ovalo plano.",
      en: "The pin is drawn with a silhouette inspired by PinReference.png and BowlingPin.blend rather than a flat oval.",
    },
    {
      es: "La simulacion de derribo usa vecindad y soporte frontal para imitar un collider simple del pack sin meter fisica pesada.",
      en: "Pinfall simulation uses neighborhood and front support to mimic a simple collider from the pack without heavyweight physics.",
    },
    {
      es: "La UI incorpora un panel de assets y un panel de reglamento para que la referencia externa quede visible dentro del juego.",
      en: "The UI includes both an asset panel and a rulebook panel so the external reference remains visible in-game.",
    },
  ],
};

export const RULEBOOK_GROUPS = [
  {
    id: "scoring",
    title: {
      es: "Cuadros y puntuacion",
      en: "Frames and scoring",
    },
    rules: [
      {
        id: 1,
        status: "simulated",
        title: { es: "Juego - definicion", en: "Game definition" },
        summary: {
          es: "La partida consta de diez cuadros; hay dos bolas en los nueve primeros salvo strike, y en el decimo hay bola extra con strike o spare.",
          en: "A game has ten frames; the first nine allow up to two balls unless there is a strike, and the tenth grants an extra ball with a strike or spare.",
        },
      },
      {
        id: 2,
        status: "simulated",
        title: { es: "Juego - como se puntua", en: "How scoring is recorded" },
        summary: {
          es: "Cada cuadro registra primero y segundo lanzamiento; el juego actualiza el marcador inmediatamente tras cada tiro.",
          en: "Each frame records first and second deliveries; the game updates the sheet immediately after every shot.",
        },
      },
      {
        id: 3,
        status: "simulated",
        title: { es: "Pleno (strike)", en: "Strike" },
        summary: {
          es: "Tirar los diez bolos con la primera bola vale 10 mas los dos lanzamientos siguientes y se marca con X.",
          en: "Knocking all ten pins down on the first ball scores 10 plus the next two deliveries and is marked with X.",
        },
      },
      {
        id: 4,
        status: "simulated",
        title: { es: "Doble", en: "Double" },
        summary: {
          es: "Dos strikes consecutivos convierten el primero en 20 mas la siguiente bola; la estadistica de dobles queda visible.",
          en: "Two consecutive strikes make the first one worth 20 plus the next ball; double tracking is shown in stats.",
        },
      },
      {
        id: 5,
        status: "simulated",
        title: { es: "Triple", en: "Triple" },
        summary: {
          es: "Tres strikes seguidos convierten el primero en 30; la partida muestra la racha de strikes y contempla la logica de 300 perfecto.",
          en: "Three strikes in a row make the first one worth 30; the game tracks strike streaks and the perfect-300 logic.",
        },
      },
      {
        id: 6,
        status: "simulated",
        title: { es: "Semipleno (spare)", en: "Spare" },
        summary: {
          es: "Derribar los bolos restantes con la segunda bola vale 10 mas el siguiente lanzamiento y se marca con /.",
          en: "Clearing the remaining pins with the second ball scores 10 plus the next delivery and is marked with /.",
        },
      },
      {
        id: 7,
        status: "simulated",
        title: { es: "Cuadro abierto", en: "Open frame" },
        summary: {
          es: "Si no caen los diez bolos en dos bolas y no hay strike o spare, el cuadro se considera abierto.",
          en: "If all ten pins are not cleared in two balls and there is no strike or spare, the frame is open.",
        },
      },
      {
        id: 8,
        status: "simulated",
        title: { es: "Split", en: "Split" },
        summary: {
          es: "Cuando cae el pin 1 y quedan bolos separados o sin apoyo delantero, el leave se marca como split con circulo visual.",
          en: "When the head pin falls and separated or unsupported pins remain, the leave is marked as a split with a visual circle.",
        },
      },
    ],
  },
  {
    id: "lane-and-pinfall",
    title: {
      es: "Pistas, bolos y legalidad del derribo",
      en: "Lanes, pins, and pinfall legality",
    },
    rules: [
      {
        id: 9,
        status: "simulated",
        title: { es: "Estilo de juego", en: "Style of play" },
        summary: {
          es: "La serie se juega sobre un par de pistas colindantes alternando A y B en cuadros sucesivos.",
          en: "The series is played on an adjacent lane pair, alternating A and B on consecutive frames.",
        },
      },
      {
        id: 10,
        status: "partial",
        title: { es: "Caida de bolos legal", en: "Legal pinfall" },
        summary: {
          es: "La simulacion asume derribo legal por defecto y considera madera muerta retirada antes del siguiente tiro.",
          en: "The simulation assumes legal pinfall by default and treats dead wood as cleared before the next shot.",
        },
      },
      {
        id: 11,
        status: "partial",
        title: { es: "Caida de bolos ilegal", en: "Illegal pinfall" },
        summary: {
          es: "Las faltas se aplican como bola lanzada y 0 bolos; otras causas de derribo ilegal quedan documentadas para arbitraje humano.",
          en: "Fouls are enforced as a thrown ball worth 0 pins; other illegal pinfall causes are documented for human officiating.",
        },
      },
      {
        id: 12,
        status: "documented",
        title: { es: "Bolos mal colocados", en: "Mis-set pins" },
        summary: {
          es: "La regla queda recogida en el reglamento visible, pero el prototipo no modela pin setting incorrecto.",
          en: "The rule is preserved in the visible rulebook, but the prototype does not model mis-set pins.",
        },
      },
      {
        id: 13,
        status: "partial",
        title: { es: "Bolos rebotados", en: "Rebounding pins" },
        summary: {
          es: "La lectura del estado final conserva bolos que sigan en pie tras el contacto; no se simula rebote fisico explicito.",
          en: "The final state keeps pins standing if they remain upright after contact; explicit bounce physics are not simulated.",
        },
      },
      {
        id: 14,
        status: "partial",
        title: { es: "Bolos no concedidos", en: "Pins may not be conceded" },
        summary: {
          es: "Solo cuentan los bolos que el motor resuelve como derribados en un lanzamiento legal.",
          en: "Only pins resolved as down by the engine on a legal delivery are scored.",
        },
      },
      {
        id: 15,
        status: "documented",
        title: { es: "Reposicion de bolos", en: "Pin replacement" },
        summary: {
          es: "La reposicion por rotura se documenta, pero no existe desgaste de material en esta version canvas.",
          en: "Replacement after damage is documented, but this canvas version has no pin wear model.",
        },
      },
      {
        id: 16,
        status: "documented",
        title: { es: "Bola muerta", en: "Dead ball" },
        summary: {
          es: "Las causas de bola muerta y repeticion del tiro quedan listadas en el panel de reglamento.",
          en: "Dead-ball causes and the replay procedure are listed in the rulebook panel.",
        },
      },
      {
        id: 17,
        status: "documented",
        title: { es: "Lanzamiento en pista equivocada", en: "Wrong lane delivery" },
        summary: {
          es: "Se documenta la anulacion del tiro o la continuidad sin ajuste segun el caso, sin automatizar arbitraje.",
          en: "The nullification or continuation rule is documented without automated officiating.",
        },
      },
    ],
  },
  {
    id: "fouls-and-competition",
    title: {
      es: "Faltas, protestas y condiciones de competicion",
      en: "Fouls, protests, and competition conditions",
    },
    rules: [
      {
        id: 18,
        status: "partial",
        title: { es: "Definicion de falta", en: "Foul definition" },
        summary: {
          es: "La interfaz contempla falta como evento reglamentario del tiro, aunque no hay sensor fisico de linea en el canvas.",
          en: "The interface treats a foul as a regulated delivery outcome, although there is no physical foul-line sensor in the canvas.",
        },
      },
      {
        id: 19,
        status: "documented",
        title: { es: "Falta deliberada", en: "Deliberate foul" },
        summary: {
          es: "La sancion de cero bolos y sin repeticion se documenta como clausula competitiva.",
          en: "The zero-pin / no-replay sanction is documented as a competitive clause.",
        },
      },
      {
        id: 20,
        status: "simulated",
        title: { es: "La falta cuenta como bola", en: "A foul counts as a ball" },
        summary: {
          es: "La falta consume lanzamiento, anota F en la planilla y deja 0 bolos contabilizados.",
          en: "A foul consumes the delivery, marks F on the sheet, and records 0 pins.",
        },
      },
      {
        id: 21,
        status: "documented",
        title: { es: "Falta evidente", en: "Apparent foul" },
        summary: {
          es: "La validacion por capitanes, anotador u oficial queda recogida en el reglamento integrado.",
          en: "Validation by captains, scorer, or official is captured in the integrated rulebook.",
        },
      },
      {
        id: 22,
        status: "documented",
        title: { es: "Apelacion de falta", en: "Foul appeal" },
        summary: {
          es: "La apelacion solo procede por fallo del detector o evidencia clara de que no hubo falta.",
          en: "Appeals only proceed for detector malfunction or clear evidence that no foul occurred.",
        },
      },
      {
        id: 23,
        status: "documented",
        title: { es: "Bola provisional", en: "Provisional ball" },
        summary: {
          es: "El panel recoge cuando procede una bola o cuadro provisional por protesta no resuelta.",
          en: "The panel records when a provisional ball or frame is required for an unresolved protest.",
        },
      },
      {
        id: 24,
        status: "documented",
        title: { es: "Superficie de la bola", en: "Ball surface changes" },
        summary: {
          es: "La prohibicion de alterar la superficie durante competicion homologada queda documentada.",
          en: "The ban on altering ball surface during certified play is documented.",
        },
      },
      {
        id: 25,
        status: "documented",
        title: { es: "Approach no alterable", en: "Approach may not be altered" },
        summary: {
          es: "Se recuerda la prohibicion de sustancias y suciedad que cambien las condiciones normales del approach.",
          en: "The rulebook preserves the ban on substances or debris that alter normal approach conditions.",
        },
      },
      {
        id: 26,
        status: "documented",
        title: { es: "Errores en el marcador", en: "Scoring errors" },
        summary: {
          es: "Los errores deben corregirse por oficial y protestarse dentro del limite temporal indicado por reglamento.",
          en: "Errors must be corrected by an official and protested within the time limit stated by the rules.",
        },
      },
    ],
  },
];

export function countRuleStatuses() {
  const counts = {
    simulated: 0,
    partial: 0,
    documented: 0,
  };

  for (const group of RULEBOOK_GROUPS) {
    for (const rule of group.rules) {
      counts[rule.status] += 1;
    }
  }

  return counts;
}
