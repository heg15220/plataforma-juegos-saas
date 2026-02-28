import neonDriftImage from "../assets/games/neon-drift.svg";
import puzzleVaultImage from "../assets/games/puzzle-vault.svg";
import wordBlitzImage from "../assets/games/word-blitz.svg";
import colonyArchitectImage from "../assets/games/colony-architect.svg";
import rhythmReactorImage from "../assets/games/rhythm-reactor.svg";
import cardTacticsImage from "../assets/games/card-tactics.svg";
import skyRunnerImage from "../assets/games/sky-runner.svg";
import neonDojoImage from "../assets/games/neon-dojo.svg";
import headSoccerArenaImage from "../assets/games/head-soccer-arena.svg";
import pacmanMazeProtocolImage from "../assets/games/pacman-maze-protocol.svg";
import pongNeonArenaImage from "../assets/games/pong-neon-arena.svg";
import knowledgeSudokuImage from "../assets/games/knowledge-sudoku.svg";
import knowledgeDominoImage from "../assets/games/knowledge-domino.svg";
import knowledgeAhorcadoImage from "../assets/games/knowledge-ahorcado.svg";
import knowledgePacienciaImage from "../assets/games/knowledge-paciencia.svg";
import knowledgePuzleImage from "../assets/games/knowledge-puzle.svg";
import knowledgeCrucigramaImage from "../assets/games/knowledge-crucigrama.svg";
import knowledgeSopaLetrasImage from "../assets/games/knowledge-sopa-letras.svg";
import chessGrandmasterArenaImage from "../assets/games/chess-grandmaster-arena.svg";

/**
 * Game catalog
 * ─────────────────────────────────────────────────────────────────────────────
 * Each entry contains a Spanish (default) set of fields plus *_en counterparts
 * for the English locale.  The helper getLocalizedGame() in src/i18n/index.js
 * picks the correct set based on the browser language.
 *
 * REQUIRED FIELDS PER GAME
 *   id          – unique slug, used as the component registry key
 *   image       – imported SVG asset
 *   category    – Spanish key used internally for filtering  (no accents, e.g. "Accion")
 *   sessionTime – language-neutral duration string, e.g. "3-6 min"
 *
 * LOCALIZED FIELDS (add both es and _en versions)
 *   title / title_en               – game name (often the same)
 *   tagline / tagline_en           – one-liner shown on the card
 *   description / description_en   – paragraph shown in the launch modal
 *   highlights / highlights_en     – bullet list of key features
 *   difficulty / difficulty_en     – difficulty label
 *   multiplayer / multiplayer_en   – mode label (Solo / Solo vs AI …)
 *   viability / viability_en       – technical viability note
 *   visualStyle / visualStyle_en   – art-direction note
 *   techFocus / techFocus_en       – tech note
 *   objective_es / objective_en    – 1-2 sentence goal statement (shown in modal)
 *   howToPlay_es / howToPlay_en    – brief control summary (shown in modal)
 */
export const games = [
  // ── Adventure ──────────────────────────────────────────────────────────────
  {
    id: "adventure-echoes",
    image: colonyArchitectImage,
    sessionTime: "4-7 min",

    title: "Echoes of the Lost Temple",
    category: "Aventura",
    tagline: "Aventura arcade táctica con pistas, salto de riesgo y extracción final.",
    description:
      "Aventura de exploración por casillas donde cada paso importa. Gestiona vida, energía, luz y amenaza mientras rastreas la reliquia oculta y vuelves al campamento base antes de quedarte sin margen.",
    objective_es: "Encuentra la reliquia oculta y vuelve al campamento base antes de quedarte sin vida, energía o margen.",
    howToPlay_es: "Muévete con WASD/flechas. Busca pistas, escanea amenazas, gestiona raciones y usa la baliza para ampliar visión. El salto táctico (B) te permite esquivar trampas críticas.",
    highlights: [
      "Mapa táctico con niebla de guerra y visión extendida por baliza.",
      "Salto táctico temporal para esquivar trampas críticas.",
      "Pistas de distancia/dirección para mantener reto sin frustración.",
      "Gestión de riesgo con raciones y amenaza dinámica.",
    ],
    difficulty: "Media-Alta",
    multiplayer: "Solo",
    viability: "Alta: mecánicas por turnos y estado ligero en cliente.",
    visualStyle: "Selva táctica con niebla, capas de escenario y telemetría de amenaza.",
    techFocus: "Director de riesgo, salto táctico tipo action-adventure y escaneo con pistas.",

    category_en: "Adventure",
    tagline_en: "Tactical arcade adventure with clues, risk jumps and final extraction.",
    description_en:
      "A tile-based exploration adventure where every step matters. Manage health, energy, light and threat while tracking the hidden relic and returning to base camp before your margins run out.",
    objective_en: "Find the hidden relic and return to base camp before running out of health, energy or margin.",
    howToPlay_en: "Move with WASD/arrows. Search for clues, scan threats, manage rations and use the beacon to expand vision. Tactical jump (B) lets you skip critical traps.",
    highlights_en: [
      "Tactical map with fog of war and extended vision via beacon.",
      "Temporary tactical jump to dodge critical traps.",
      "Distance/direction clues to keep the challenge without frustration.",
      "Risk management with rations and dynamic threat.",
    ],
    difficulty_en: "Medium-High",
    multiplayer_en: "Solo",
    viability_en: "High: turn-based mechanics and lightweight client state.",
    visualStyle_en: "Tactical jungle with fog, scene layers and threat telemetry.",
    techFocus_en: "Risk director, action-adventure tactical leap and clue-based scanning.",
  },

  // ── Action ─────────────────────────────────────────────────────────────────
  {
    id: "action-core-strike",
    image: rhythmReactorImage,
    sessionTime: "2-4 min",

    title: "Core Strike Arena",
    category: "Accion",
    tagline: "Arena shooter por rondas con foco, overdrive y score competitivo.",
    description:
      "Combate intenso contra una IA ofensiva. Debes leer la intención rival, administrar foco/munición y reaccionar con rapidez para tumbar al enemigo antes de que termine el cronómetro de arena.",
    objective_es: "Derrota al enemigo antes de que acabe el cronómetro. Sobrevive tres rondas acumulando el mayor score posible.",
    howToPlay_es: "Muévete con WASD/flechas. Alterna entre ráfaga, cohete, overdrive, defensa y botiquín según la situación de cada ronda.",
    highlights: [
      "Sistema de combate reactivo con overdrive y botiquines limitados.",
      "Tres rondas con escalado de vida enemiga y bonus por tiempo.",
      "Intención enemiga visible para decisiones tácticas más limpias.",
      "Partidas cortas con curva de riesgo clara.",
    ],
    difficulty: "Media-Alta",
    multiplayer: "Solo vs IA",
    viability: "Alta: bucle en tiempo real con intervalos controlados.",
    visualStyle: "Arena shooter estilizada con telemetría de combate y amenazas visibles.",
    techFocus: "Formato por rondas, lectura de intención enemiga, score y gestión de cooldowns.",

    category_en: "Action",
    tagline_en: "Round-based arena shooter with focus, overdrive and competitive score.",
    description_en:
      "Intense combat against an offensive AI. Read the enemy's intent, manage focus/ammo and react quickly to take down the enemy before the arena timer runs out.",
    objective_en: "Defeat the enemy before the timer runs out. Survive three rounds with the highest score possible.",
    howToPlay_en: "Move with WASD/arrows. Alternate between burst, rocket, overdrive, defense and medkit depending on each round's situation.",
    highlights_en: [
      "Reactive combat system with overdrive and limited medkits.",
      "Three rounds with escalating enemy health and time bonus.",
      "Visible enemy intent for cleaner tactical decisions.",
      "Short matches with a clear risk curve.",
    ],
    difficulty_en: "Medium-High",
    multiplayer_en: "Solo vs AI",
    viability_en: "High: real-time loop with controlled intervals.",
    visualStyle_en: "Stylized arena shooter with combat telemetry and visible threats.",
    techFocus_en: "Round format, enemy intent reading, score and cooldown management.",
  },

  // ── Adventure (platformer) ─────────────────────────────────────────────────
  {
    id: "platformer-sky-runner",
    image: skyRunnerImage,
    sessionTime: "3-6 min",

    title: "Sky Runner DX",
    category: "Aventura",
    tagline: "Plataformas 2D arcade con rutas aleatorias, mapas verticales y jefes con barra de vida.",
    description:
      "Run arcade inspirado en plataformas retro: cada partida mezcla 5 mapas aleatorios (horizontales, verticales e híbridos), incluye al menos dos encuentros contra jefe y cierra siempre con un jefe final.",
    objective_es: "Completa una campaña de 5 mapas aleatorios superando enemigos y jefes para llegar al jefe final.",
    howToPlay_es: "A/D o flechas para moverte, W/arriba/espacio para saltar, F activa el power-up de fuego. Cada run mezcla 5 mapas en orden aleatorio.",
    highlights: [
      "Campaña procedural corta: 5 mapas por run con orden aleatorio.",
      "Mapas de escalada vertical y rutas híbridas además de side-scroll clásico.",
      "Dos encuentros de jefe por partida con barra de vida y fases de daño.",
      "Física arcade consistente con coyote time y jump buffer.",
      "IA enemiga de patrulla + jefe con comportamiento ofensivo.",
      "Power-up de fuego para derrotar enemigos a distancia.",
      "Estado QA exportado para automatización de pruebas.",
    ],
    difficulty: "Media-Alta",
    multiplayer: "Solo",
    viability: "Alta: motor modular Canvas con game loop fijo y colisiones por tiles.",
    visualStyle: "Pixel-art retro con dirección scratch-like, parallax multicapa y HUD de jefe en combate.",
    techFocus: "Arquitectura modular con campaña aleatoria de 5 mapas, layouts mixtos y sistema de boss fight.",

    category_en: "Adventure",
    tagline_en: "2D arcade platformer with random routes, vertical maps and bosses with health bars.",
    description_en:
      "A retro platformer run: each session mixes 5 random maps (horizontal, vertical and hybrid), includes at least two boss encounters and always ends with a final boss.",
    objective_en: "Complete a 5-map random campaign, defeating enemies and bosses to reach the final boss.",
    howToPlay_en: "A/D or arrows to move, W/up/space for variable jump, F to activate the fire power-up. Each run mixes 5 maps in random order.",
    highlights_en: [
      "Short procedural campaign: 5 maps per run in random order.",
      "Vertical climbing maps and hybrid routes alongside classic side-scroll.",
      "Two boss encounters per run with health bar and damage phases.",
      "Consistent arcade physics with coyote time and jump buffer.",
      "Patrol enemy AI and boss with offensive behavior.",
      "Fire power-up to defeat distant enemies.",
      "Exported QA state for test automation.",
    ],
    difficulty_en: "Medium-High",
    multiplayer_en: "Solo",
    viability_en: "High: modular Canvas engine with fixed game loop and tile collisions.",
    visualStyle_en: "Retro pixel-art with scratch-like direction, multi-layer parallax and boss HUD.",
    techFocus_en: "Modular architecture with 5-map random campaign, mixed layouts and boss fight system.",
  },

  // ── Action (fighter) ───────────────────────────────────────────────────────
  {
    id: "fighter-neon-dojo",
    image: neonDojoImage,
    sessionTime: "2-5 min",

    title: "Neon Dojo Clash",
    category: "Accion",
    tagline: "Fighting 2D con guardia, combos, medidor y rival IA.",
    description:
      "Combate 1v1 enfocado en fundamentos de fighting games: confirmar golpes, gestionar guardia y decidir cuándo gastar meter en un special de alto impacto.",
    objective_es: "Reduce la vida del oponente a cero antes de que lo haga él. Usa combos, guardia y especiales de forma estratégica.",
    howToPlay_es: "A/D o flechas para moverte, W/arriba para saltar. J/espacio jab, K/enter heavy, L/abajo guardia, U/B especial.",
    highlights: [
      "Ataques light/heavy/special con startup/active/recovery.",
      "Guardia con ruptura y castigo por sobreuso.",
      "Input buffer para confirmar secuencias cortas de combo.",
      "IA reactiva que ajusta distancia y elección de ataque.",
      "Feedback audiovisual de impacto, bloqueo y ruptura de guardia.",
    ],
    difficulty: "Alta",
    multiplayer: "Solo vs IA",
    viability: "Alta: loop en tiempo real con hitbox lógica e input buffer.",
    visualStyle: "Arena neón de combate con luchadores humanos animados por estado.",
    techFocus: "State machine de lucha, ventana de ataques y audio por hit/block/KO.",

    category_en: "Action",
    tagline_en: "2D fighting with guard, combos, meter and AI opponent.",
    description_en:
      "1v1 combat focused on fighting game fundamentals: confirm hits, manage guard and decide when to spend meter on a high-impact special move.",
    objective_en: "Reduce the opponent's health to zero before they do the same. Use combos, guard and specials strategically.",
    howToPlay_en: "A/D or arrows to move, W/up to jump. J/space jab, K/enter heavy, L/down guard, U/B special.",
    highlights_en: [
      "Light/heavy/special attacks with startup/active/recovery frames.",
      "Guard with break mechanic and penalty for overuse.",
      "Input buffer for confirming short combo sequences.",
      "Reactive AI that adjusts distance and attack choice.",
      "Audiovisual feedback for impact, block and guard break.",
    ],
    difficulty_en: "High",
    multiplayer_en: "Solo vs AI",
    viability_en: "High: real-time loop with logical hitboxes and input buffer.",
    visualStyle_en: "Neon combat arena with state-animated human fighters.",
    techFocus_en: "Fighting state machine, attack windows and per-hit/block/KO audio.",
  },

  // ── Arcade ─────────────────────────────────────────────────────────────────
  {
    id: "arcade-pacman-maze-protocol",
    image: pacmanMazeProtocolImage,
    sessionTime: "4-9 min",

    title: "Pac-Man Maze Protocol",
    category: "Arcade",
    tagline: "Arcade de laberinto con persecución, pellets, power mode y FSM de fantasmas.",
    description:
      "Versión completa de Pac-Man con mapa por tiles, túneles laterales, 4 fantasmas con comportamientos diferenciados, sistema de vidas/puntuación/niveles y modo debug para validar IA y colisiones.",
    objective_es: "Recoge todos los pellets del laberinto sin ser atrapado por los fantasmas. Usa power pellets para revertir los roles.",
    howToPlay_es: "WASD o flechas para moverte. Enter/Espacio para empezar, P/Esc para pausa, R reinicia, M activa el sonido.",
    highlights: [
      "FSM de fantasmas con modos scatter, chase, frightened y eaten.",
      "Targeting fiel: Blinky/Pinky/Inky/Clyde con reglas distintas.",
      "Power pellets con bonus de fantasmas encadenado (200/400/800/1600).",
      "Loop fijo 60 ticks + render Canvas y puente QA render_game_to_text.",
      "HUD con score, high score persistente, vidas, nivel y métricas de frame.",
    ],
    difficulty: "Media-Alta",
    multiplayer: "Solo",
    viability: "Alta: motor Canvas 2D desacoplado con IA por estados y pathfinding BFS.",
    visualStyle: "Laberinto neón oscuro con lectura clara de rutas, pellets y estados de fantasmas.",
    techFocus: "Arquitectura modular engine/world/entities/ai/state + HUD React desacoplado.",

    category_en: "Arcade",
    tagline_en: "Maze arcade with pursuit, pellets, power mode and ghost FSM.",
    description_en:
      "Full Pac-Man with tile map, side tunnels, 4 ghosts with distinct behaviors, lives/score/levels system and debug mode to validate AI and collisions.",
    objective_en: "Collect all pellets in the maze without being caught by ghosts. Use power pellets to reverse roles.",
    howToPlay_en: "WASD or arrows to move. Enter/Space to start, P/Esc to pause, R restart, M toggle sound.",
    highlights_en: [
      "Ghost FSM with scatter, chase, frightened and eaten modes.",
      "Faithful targeting: Blinky/Pinky/Inky/Clyde with distinct rules.",
      "Power pellets with chained ghost bonus (200/400/800/1600).",
      "Fixed 60-tick loop, Canvas render and QA bridge render_game_to_text.",
      "HUD with score, persistent high score, lives, level and frame metrics.",
    ],
    difficulty_en: "Medium-High",
    multiplayer_en: "Solo",
    viability_en: "High: decoupled 2D Canvas engine with FSM AI and BFS pathfinding.",
    visualStyle_en: "Dark neon maze with clear route, pellet and ghost-state readability.",
    techFocus_en: "Modular engine/world/entities/ai/state architecture + decoupled React HUD.",
  },

  {
    id: "arcade-pong-neon-arena",
    image: pongNeonArenaImage,
    sessionTime: "3-8 min",

    title: "Pong Neon Arena",
    category: "Arcade",
    tagline: "Pong clásico 1 vs IA con física de english, dificultad adaptativa y audio Web.",
    description:
      "Versión avanzada del Pong original con física realista de spin (english), IA adaptativa con tres perfiles de juego, sistema de puntuación por tiempo o marcador, efectos de partículas y audio generado por Web Audio API.",
    objective_es: "Alcanza 9 puntos antes que la IA o consigue la mayor puntuación cuando expire el tiempo. Usa el ángulo de golpe para engañar a la CPU.",
    howToPlay_es: "W/S o flechas arriba/abajo para mover la raqueta. Ratón sobre el canvas también funciona. Enter/Espacio para empezar, P pausa, R reinicia, M sonido, F pantalla completa. Pulsa el botón de dificultad para ciclar entre Rookie, Arcade y Pro.",
    highlights: [
      "Física de english (spin) según zona de impacto en la raqueta.",
      "IA con tres perfiles: BAL (equilibrado), AGR (agresivo), DEF (defensivo).",
      "Loop de física a 120 Hz desacoplado del render para precisión máxima.",
      "Audio procedural con Web Audio API: golpes, paredes, goles y victoria.",
      "Rally tracker, récord persistente y sistema de victorias acumulado.",
    ],
    difficulty: "Media",
    multiplayer: "Solo vs IA",
    viability: "Alta: motor Canvas 2D puro con física determinista y sin dependencias externas.",
    visualStyle: "Neón oscuro con raquetas cyan/ámbar, partículas de impacto y trail de balón.",
    techFocus: "Loop fijo 120Hz + render RAF, IA con dificultad dinámica y Web Audio API procedural.",

    category_en: "Arcade",
    tagline_en: "Classic Pong 1 vs AI with english physics, adaptive difficulty and Web Audio.",
    description_en:
      "An advanced take on the original Pong featuring realistic spin physics, adaptive AI with three play profiles, score-by-time or scorecard system, particle effects and procedural audio via Web Audio API.",
    objective_en: "Reach 9 points before the AI or score the most when time runs out. Use shot angle to trick the CPU.",
    howToPlay_en: "W/S or up/down arrows move your paddle. Mouse over the canvas also works. Enter/Space to start, P pause, R restart, M sound, F fullscreen. Click the difficulty button to cycle through Rookie, Arcade and Pro.",
    highlights_en: [
      "English (spin) physics based on paddle impact zone.",
      "AI with three profiles: BAL (balanced), AGR (aggressive), DEF (defensive).",
      "120 Hz physics loop decoupled from render for maximum precision.",
      "Procedural audio with Web Audio API: hits, walls, goals and victory.",
      "Rally tracker, persistent record and cumulative win counter.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo vs AI",
    viability_en: "High: pure 2D Canvas engine with deterministic physics and no external dependencies.",
    visualStyle_en: "Dark neon with cyan/amber paddles, impact particles and ball trail.",
    techFocus_en: "Fixed 120Hz loop + RAF render, dynamic difficulty AI and procedural Web Audio API.",
  },

  // ── Sports ─────────────────────────────────────────────────────────────────
  {
    id: "sports-head-soccer-arena",
    image: headSoccerArenaImage,
    sessionTime: "3-6 min",

    title: "Head Soccer Arena X",
    category: "Deportes",
    tagline: "Fútbol 1v1 arcade con poderes, IA escalable y estadios animados.",
    description:
      "Partidos rápidos 1v1 con controles directos y game feel exagerado. Marca más goles que la CPU usando cabezazos, disparos, salto arcade y una habilidad especial por personaje.",
    objective_es: "Marca más goles que la CPU en el tiempo reglamentario usando cabezazos, disparos y habilidades especiales.",
    howToPlay_es: "Flechas izq/der para moverte, arriba para saltar, Espacio para disparar, B para activar la habilidad especial.",
    highlights: [
      "Movimiento lateral, salto, disparo y celebración por gol.",
      "Balón elástico con rebotes fuertes, estela de fuego y partículas.",
      "Habilidades únicas: fuego, congelar, súper salto y mega tamaño.",
      "IA arcade con tres dificultades y reacción contextual al balón.",
      "HUD completo: marcador, energía de habilidad, temporizador y eventos.",
    ],
    difficulty: "Media-Alta",
    multiplayer: "Solo vs IA",
    viability: "Alta: motor Canvas 2D con física arcade, colisiones y habilidades por cooldown.",
    visualStyle: "Cartoon cabezón, estadios día/noche/futuro y VFX de impacto/fuego.",
    techFocus: "Loop fijo update-physics-render, IA por dificultad y estado QA determinista.",

    category_en: "Sports",
    tagline_en: "1v1 arcade soccer with powers, scalable AI and animated stadiums.",
    description_en:
      "Fast 1v1 matches with direct controls and exaggerated game feel. Score more goals than the CPU using headers, shots, arcade jumping and a character-specific special ability.",
    objective_en: "Score more goals than the CPU within regulation time using headers, shots and special abilities.",
    howToPlay_en: "Left/right arrows to move, up to jump, Space to shoot, B to trigger your special ability.",
    highlights_en: [
      "Lateral movement, jump, shot and goal celebration.",
      "Elastic ball with strong bounces, fire trail and particles.",
      "Unique abilities: fire, freeze, super jump and mega size.",
      "Arcade AI with three difficulties and contextual ball reaction.",
      "Full HUD: scoreboard, ability energy, timer and events.",
    ],
    difficulty_en: "Medium-High",
    multiplayer_en: "Solo vs AI",
    viability_en: "High: 2D Canvas engine with arcade physics, collisions and cooldown abilities.",
    visualStyle_en: "Big-head cartoon, day/night/future stadiums and impact/fire VFX.",
    techFocus_en: "Fixed update-physics-render loop, difficulty-based AI and deterministic QA state.",
  },

  // ── Racing ─────────────────────────────────────────────────────────────────
  {
    id: "racing-neon-lanes",
    image: neonDriftImage,
    sessionTime: "2-5 min",

    title: "Neon Lanes Rush",
    category: "Carreras",
    tagline: "Carreras arcade por carril con clima, near-miss, turbo y cajas de ítem.",
    description:
      "Juego de carreras arcade centrado en reflejos. Cambia de carril para evitar obstáculos, adapta tu conducción al clima y completa la distancia objetivo maximizando near-miss y turbo.",
    objective_es: "Recorre la distancia objetivo evitando obstáculos y maximiza near-miss y turbo para el mayor score posible.",
    howToPlay_es: "Izq/der para cambiar carril, arriba/abajo para velocidad, Espacio para turbo, I para usar ítem recogido.",
    highlights: [
      "Control rápido con teclado o botones táctiles.",
      "Renderizado en canvas con motor Phaser y estado serializable.",
      "Cajas de ítem con Pulso EMP o kit de reparación.",
      "Escudo de recuperación para evitar derrotas injustas.",
      "Clima y estabilidad que cambian el ritmo de carrera.",
    ],
    difficulty: "Media",
    multiplayer: "Solo",
    viability: "Alta: motor Phaser en canvas con loop determinista y telemetría QA.",
    visualStyle: "Arcade racing con HUD competitivo, scroll de pista y estados climáticos visibles.",
    techFocus: "Loop Phaser por ticks, cadena near-miss y sistema de ítems ofensivo/defensivo.",

    category_en: "Racing",
    tagline_en: "Arcade lane racing with weather, near-miss, turbo and item boxes.",
    description_en:
      "A reflex-focused arcade racing game. Change lanes to avoid obstacles, adapt your driving to the weather and complete the target distance by maximizing near-miss chains and turbo.",
    objective_en: "Cover the target distance avoiding obstacles, use turbo and maximize near-misses for the highest score.",
    howToPlay_en: "Left/right to change lane, up/down for speed, Space for turbo, I to use a collected item.",
    highlights_en: [
      "Fast control with keyboard or touch buttons.",
      "Canvas rendering with Phaser engine and serializable state.",
      "Item boxes with EMP Pulse or repair kit.",
      "Recovery shield to prevent unfair defeats.",
      "Weather and stability that change the racing pace.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo",
    viability_en: "High: Phaser canvas engine with deterministic loop and QA telemetry.",
    visualStyle_en: "Arcade racing with competitive HUD, track scroll and visible weather states.",
    techFocus_en: "Tick-based Phaser loop, near-miss chain and offensive/defensive item system.",
  },

  // ── Knowledge ──────────────────────────────────────────────────────────────
  {
    id: "knowledge-quiz-nexus",
    image: wordBlitzImage,
    sessionTime: "4-8 min",

    title: "Quiz Nexus",
    category: "Conocimiento",
    tagline: "Rondas de conocimiento con límite de tiempo por pregunta.",
    description:
      "Juego de preguntas por bloques temáticos con feedback inmediato. Combina rapidez y precisión para acumular puntos y cerrar la sesión con rango experto.",
    objective_es: "Responde el mayor número de preguntas correctamente dentro del tiempo límite para alcanzar el rango experto.",
    howToPlay_es: "Selecciona la respuesta pulsando el botón correspondiente y avanza al bloquear la pregunta.",
    highlights: [
      "Banco de preguntas reutilizable y ampliable (>10k).",
      "Cambio automático de idioma: navegador es → español; resto → inglés.",
      "Temporizador por ronda para aumentar desafío.",
      "Sistema de puntuación y ranking final.",
    ],
    difficulty: "Baja-Media",
    multiplayer: "Solo",
    viability: "Alta: banco masivo local con i18n por idioma de navegador.",
    visualStyle: "Panel quiz premium con identidad neón y lectura rápida de feedback.",
    techFocus: "Selección balanceada por tópicos, i18n es/en y puntuación por racha.",

    category_en: "Knowledge",
    tagline_en: "Knowledge rounds with a time limit per question.",
    description_en:
      "A question game in thematic blocks with immediate feedback. Combine speed and accuracy to accumulate points and end the session with an expert rank.",
    objective_en: "Answer as many questions correctly as possible within the time limit to reach the expert rank.",
    howToPlay_en: "Select an answer by clicking its button and advance after locking the question.",
    highlights_en: [
      "Reusable and expandable question bank (>10k).",
      "Automatic language switch: browser es → Spanish; other → English.",
      "Per-round timer to increase challenge.",
      "Scoring system and final ranking.",
    ],
    difficulty_en: "Low-Medium",
    multiplayer_en: "Solo",
    viability_en: "High: large local bank with browser-language i18n.",
    visualStyle_en: "Premium quiz panel with neon identity and fast feedback readability.",
    techFocus_en: "Topic-balanced selection, es/en i18n and streak-based scoring.",
  },

  {
    id: "knowledge-sudoku-sprint",
    image: knowledgeSudokuImage,
    sessionTime: "3-7 min",

    title: "Sudoku Sprint 4x4",
    category: "Conocimiento",
    tagline: "Sudoku de resolución rápida con validación inmediata y control por teclado.",
    description:
      "Modo de agilidad mental en formato Sudoku 4x4. Rellena celdas sin repetir números y completa el tablero con cero conflictos.",
    objective_es: "Rellena el tablero Sudoku 4x4 sin repetir números en filas, columnas ni bloques.",
    howToPlay_es: "Flechas para navegar celdas, teclas 1-4 o A/S/D/F para rellenar, Backspace/Delete para borrar, R para nueva partida aleatoria.",
    highlights: [
      "Selección de celda por ratón o flechas.",
      "Entrada numérica por teclas 1-4 y atajos A/S/D/F.",
      "Detección de conflictos en tiempo real.",
      "Payload QA con tablero, selección y estado de resolución.",
    ],
    difficulty: "Media",
    multiplayer: "Solo",
    viability: "Alta: lógica determinista y estado compacto 100% cliente.",
    visualStyle: "Panel oscuro premium con rejilla 4x4 y feedback de conflictos.",
    techFocus: "Validación de fila/columna/bloque + bridge QA de estado serializable.",

    category_en: "Knowledge",
    tagline_en: "Quick-solve Sudoku with immediate validation and keyboard control.",
    description_en:
      "A mental agility mode in 4x4 Sudoku format. Fill cells without repeating numbers and complete the board with zero conflicts.",
    objective_en: "Fill the 4x4 Sudoku board without repeating numbers in any row, column or block.",
    howToPlay_en: "Arrows to navigate cells, keys 1-4 or A/S/D/F to fill, Backspace/Delete to clear, R for a random new match.",
    highlights_en: [
      "Cell selection by mouse or arrows.",
      "Number input with keys 1-4 and A/S/D/F shortcuts.",
      "Real-time conflict detection.",
      "QA payload with board, selection and resolution status.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo",
    viability_en: "High: deterministic logic and compact 100% client-side state.",
    visualStyle_en: "Premium dark panel with 4x4 grid and conflict feedback.",
    techFocus_en: "Row/column/block validation + serializable QA state bridge.",
  },

  // ── Strategy ───────────────────────────────────────────────────────────────
  {
    id: "knowledge-domino-chain",
    image: knowledgeDominoImage,
    sessionTime: "6-18 min",

    title: "Domino Clásico Arena",
    category: "Estrategia",
    tagline: "Dominó completo por rondas con tranca, puntuación y rival IA configurable.",
    description:
      "Implementación completa del dominó clásico (doble-seis) en modo estrategia: salida por ficha alta, turnos con jugadas legales, pases, cierre por tranca, puntuación por rondas y victoria global por objetivo de puntos.",
    objective_es: "Gana rondas de dominó contra la IA acumulando puntos hasta alcanzar el objetivo de victoria.",
    howToPlay_es: "Flechas izq/der eligen ficha, arriba/abajo eligen extremo, Enter juega, P pasa turno, N avanza ronda, R reinicia.",
    highlights: [
      "IA por dificultad: fácil (aleatoria), media (heurística) y difícil (minimax).",
      "Reglas de dominó y tranca con recuento de puntos en mano.",
      "Partida multi-ronda con objetivo configurable y resumen de cierre.",
      "Panel de reglas integrado con prompt completo y bridge QA.",
    ],
    difficulty: "Variable (Fácil/Media/Difícil)",
    multiplayer: "Solo vs IA",
    viability: "Alta: reglas discretas, IA heurística/minimax y estado serializable para QA.",
    visualStyle: "Mesa estratégica con lectura clara de extremos, manos y marcador por ronda.",
    techFocus: "Motor completo de rondas con tranca, scoring acumulado e IA multi-nivel.",

    category_en: "Strategy",
    tagline_en: "Full domino by rounds with lock, scoring and configurable AI opponent.",
    description_en:
      "A full classic domino (double-six) game in strategy mode: high-tile opening, turns with legal plays, passes, lock-by-blockage ending, round scoring and global victory by points target.",
    objective_en: "Win domino rounds against the AI by accumulating points until you reach the victory target.",
    howToPlay_en: "Left/right arrows choose tile, up/down choose edge, Enter plays, P passes, N advances round, R restarts.",
    highlights_en: [
      "AI by difficulty: easy (random), medium (heuristic) and hard (minimax).",
      "Domino and blockage rules with hand point counting.",
      "Multi-round match with configurable target and close summary.",
      "Integrated rules panel with full prompt and QA bridge.",
    ],
    difficulty_en: "Variable (Easy/Medium/Hard)",
    multiplayer_en: "Solo vs AI",
    viability_en: "High: discrete rules, heuristic/minimax AI and serializable QA state.",
    visualStyle_en: "Strategy table with clear edge, hand and round-score readability.",
    techFocus_en: "Full round engine with blockage, cumulative scoring and multi-level AI.",
  },

  // ── Knowledge (continued) ──────────────────────────────────────────────────
  {
    id: "knowledge-ahorcado-flash",
    image: knowledgeAhorcadoImage,
    sessionTime: "2-4 min",

    title: "Ahorcado Flash",
    category: "Conocimiento",
    tagline: "Adivina palabras con pista temática y límite de fallos.",
    description:
      "Juego clásico de palabras: usa las pistas y acierta letras antes de perder todos los intentos disponibles.",
    objective_es: "Adivina la palabra oculta letra a letra antes de agotar todos los intentos disponibles.",
    howToPlay_es: "Escribe letras para adivinar la palabra. Cuando termines, pulsa Enter o el botón de partida aleatoria para una nueva palabra.",
    highlights: [
      "Diccionario temático orientado a conocimiento general.",
      "Teclado virtual + input físico.",
      "Cambio de palabra al reiniciar para variar partidas.",
      "Bridge QA con máscara, letras usadas e intentos restantes.",
    ],
    difficulty: "Baja-Media",
    multiplayer: "Solo",
    viability: "Alta: conjunto acotado de palabras, flujo simple y rejugable.",
    visualStyle: "Interfaz neón con barra de progreso de errores y teclado virtual.",
    techFocus: "Entrada por teclado global, máscara de palabra y gestión de intentos.",

    category_en: "Knowledge",
    tagline_en: "Guess words with a themed clue and error limit.",
    description_en: "Classic word game: use clues and guess letters before losing all available attempts.",
    objective_en: "Guess the hidden word letter by letter before running out of all available attempts.",
    howToPlay_en: "Type letters to guess the word. When finished, press Enter or the random match button for a new word.",
    highlights_en: [
      "Knowledge-oriented thematic dictionary.",
      "Virtual keyboard + physical input.",
      "Word change on restart for game variety.",
      "QA bridge with mask, used letters and remaining attempts.",
    ],
    difficulty_en: "Low-Medium",
    multiplayer_en: "Solo",
    viability_en: "High: bounded word set, simple and replayable flow.",
    visualStyle_en: "Neon interface with error progress bar and virtual keyboard.",
    techFocus_en: "Global keyboard input, word mask and attempt management.",
  },

  {
    id: "knowledge-paciencia-lite",
    image: knowledgePacienciaImage,
    sessionTime: "4-8 min",

    title: "Paciencia Clásica Lite",
    category: "Conocimiento",
    tagline: "Solitario compacto con stock, descarte y fundaciones por palo.",
    description:
      "Versión ligera de paciencia: roba cartas, organiza columnas y construye fundaciones de As a 7 para ganar la ronda.",
    objective_es: "Construye las cuatro fundaciones de As a 7 organizando correctamente las columnas del solitario.",
    howToPlay_es: "D roba, A selecciona descarte, Q/W/E/R columnas, flechas cambian destino, Enter/Espacio mueven, P lanza partida aleatoria.",
    highlights: [
      "Stock/descarte con reciclado cuando se agota el mazo.",
      "Fundaciones por palo con progreso visible.",
      "Destino de columna controlado por teclado y UI.",
      "Auto-selección a fundación para acelerar flujo.",
    ],
    difficulty: "Media-Alta",
    multiplayer: "Solo",
    viability: "Alta: motor de reglas discreto sin dependencias externas.",
    visualStyle: "Mesa de cartas minimalista con estados de selección y destino.",
    techFocus: "Reglas de movimiento tipo solitario + progresión por fundaciones.",

    category_en: "Knowledge",
    tagline_en: "Compact solitaire with stock, waste and suit foundations.",
    description_en:
      "A lightweight patience game: draw cards, organize columns and build foundations from Ace to 7 to win the round.",
    objective_en: "Build all four foundations from Ace to 7 by correctly organizing the solitaire columns.",
    howToPlay_en: "D draws, A selects waste, Q/W/E/R columns, arrows change target, Enter/Space moves, P loads a random match.",
    highlights_en: [
      "Stock/waste with recycling when the deck runs out.",
      "Suit foundations with visible progress.",
      "Column destination controlled by keyboard and UI.",
      "Auto-selection to foundation to speed up flow.",
    ],
    difficulty_en: "Medium-High",
    multiplayer_en: "Solo",
    viability_en: "High: discrete rules engine with no external dependencies.",
    visualStyle_en: "Minimalist card table with selection and destination states.",
    techFocus_en: "Solitaire movement rules + foundation-based progression.",
  },

  {
    id: "knowledge-puzle-deslizante",
    image: knowledgePuzleImage,
    sessionTime: "2-6 min",

    title: "Puzle Deslizante 8",
    category: "Conocimiento",
    tagline: "Ordena fichas del 1 al 8 moviendo el hueco vacío.",
    description: "Puzzle numérico clásico de 8 piezas. Mueve las fichas adyacentes para ordenar la secuencia completa.",
    objective_es: "Ordena las fichas del 1 al 8 deslizando el espacio vacío para completar la secuencia.",
    howToPlay_es: "Usa las flechas para mover el hueco o pulsa fichas adyacentes directamente. R carga una nueva partida aleatoria.",
    highlights: [
      "Control dual: teclado y ratón.",
      "Conteo de movimientos por partida.",
      "Finalización automática al detectar secuencia correcta.",
      "Payload QA con posición exacta de cada ficha.",
    ],
    difficulty: "Media",
    multiplayer: "Solo",
    viability: "Alta: algoritmo de swap simple y estado totalmente determinista.",
    visualStyle: "Grid 3x3 limpio con foco en legibilidad y ritmo rápido.",
    techFocus: "Movimientos por flechas/click y verificación instantánea de solución.",

    category_en: "Knowledge",
    tagline_en: "Order tiles 1 to 8 by moving the empty space.",
    description_en: "Classic 8-piece sliding puzzle. Move adjacent tiles to sort the complete sequence.",
    objective_en: "Sort tiles 1 to 8 by sliding the empty space to complete the sequence.",
    howToPlay_en: "Use arrows to move the blank or click adjacent tiles directly. R loads a new random match.",
    highlights_en: [
      "Dual control: keyboard and mouse.",
      "Move counter per game.",
      "Automatic completion when the correct sequence is detected.",
      "QA payload with exact position of each tile.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo",
    viability_en: "High: simple swap algorithm and fully deterministic state.",
    visualStyle_en: "Clean 3x3 grid focused on readability and fast pacing.",
    techFocus_en: "Arrow/click moves and instant solution verification.",
  },

  {
    id: "knowledge-crucigrama-mini",
    image: knowledgeCrucigramaImage,
    sessionTime: "4-9 min",

    title: "Crucigrama Mini",
    category: "Conocimiento",
    tagline: "Crucigrama compacto con pistas horizontales y verticales.",
    description:
      "Rellena una rejilla de crucigrama mini siguiendo pistas. El juego valida progreso y permite comprobar resultados en cualquier momento.",
    objective_es: "Rellena toda la rejilla del crucigrama usando las pistas horizontales y verticales.",
    howToPlay_es: "Flechas para navegar, letras para escribir, Backspace para borrar, Enter para comprobar. Usa el botón de nueva partida para cambiar el puzle.",
    highlights: [
      "Casillas bloqueadas y selección activa visible.",
      "Escritura por teclado con retroceso y desplazamiento.",
      "Botón de comprobación para detectar errores.",
      "Bridge QA con rejilla editable completa.",
    ],
    difficulty: "Media",
    multiplayer: "Solo",
    viability: "Alta: rejilla fija de bajo coste y validación por comparación directa.",
    visualStyle: "Panel de letras con celdas bloqueadas y listado de pistas lateral.",
    techFocus: "Edición celda a celda, navegación por flechas y comprobación de solución.",

    category_en: "Knowledge",
    tagline_en: "Compact crossword with horizontal and vertical clues.",
    description_en:
      "Fill a mini crossword grid following clues. The game validates progress and allows checking results at any time.",
    objective_en: "Fill the entire crossword grid using the horizontal and vertical clues.",
    howToPlay_en: "Arrows to navigate, letters to type, Backspace to clear, Enter to check. Use the new game button to change the puzzle.",
    highlights_en: [
      "Blocked cells and visible active selection.",
      "Keyboard typing with backspace and scroll.",
      "Check button to detect errors.",
      "QA bridge with full editable grid.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo",
    viability_en: "High: fixed low-cost grid and direct-comparison validation.",
    visualStyle_en: "Letter panel with blocked cells and lateral clue list.",
    techFocus_en: "Cell-by-cell editing, arrow navigation and solution checking.",
  },

  {
    id: "knowledge-sopa-letras-mega",
    image: knowledgeSopaLetrasImage,
    sessionTime: "4-10 min",

    title: "Sopa de Letras Mega",
    category: "Conocimiento",
    tagline: "Tablero grande 20x20 con 10.000 partidas ES/EN y palabras en 8 direcciones.",
    description:
      "Encuentra palabras de conocimiento general dentro de una rejilla grande. Cada partida cambia de forma determinista y permite localizar palabras en horizontal, vertical o diagonal, tanto en sentido normal como al revés.",
    objective_es: "Encuentra todas las palabras ocultas en la rejilla 20x20 en horizontal, vertical o diagonal.",
    howToPlay_es: "Arrastra o marca inicio-fin para seleccionar palabras en horizontal, vertical o diagonal (también al revés). R carga una nueva partida aleatoria.",
    highlights: [
      "Tablero grande 20x20 para sesiones de búsqueda más largas.",
      "10.000 combinaciones por idioma (es/en) según locale del navegador.",
      "Selección por arrastre o click inicio-fin con soporte de dirección inversa.",
      "Palabras reales de ciencia, historia, lenguaje, salud y cultura.",
      "Bridge QA con estado serializado de progreso y palabras pendientes.",
    ],
    difficulty: "Media",
    multiplayer: "Solo",
    viability: "Alta: generador determinista por semilla, estado ligero y validación directa por trazado.",
    visualStyle: "Panel premium de letras con rejilla amplia, trazado en vivo y listado de objetivos.",
    techFocus: "Generación procedural bilingüe de 10k partidas + detección de líneas (horizontal/reversa/vertical/diagonal).",

    category_en: "Knowledge",
    tagline_en: "Large 20x20 board with 10,000 ES/EN matches and words in 8 directions.",
    description_en:
      "Find general knowledge words within a large grid. Each match changes deterministically and lets you locate words horizontally, vertically or diagonally, in both normal and reverse directions.",
    objective_en: "Find all hidden words in the 20x20 grid horizontally, vertically or diagonally.",
    howToPlay_en: "Drag or click start-end to select words horizontally, vertically or diagonally (reverse also works). Press R for a new random match.",
    highlights_en: [
      "Large 20x20 board for longer search sessions.",
      "10,000 combinations per language (es/en) based on browser locale.",
      "Selection by drag or start-end click with reverse direction support.",
      "Real words from science, history, language, health and culture.",
      "QA bridge with serialized state of progress and pending words.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo",
    viability_en: "High: seed-based deterministic generator, lightweight state and direct trace validation.",
    visualStyle_en: "Premium letter panel with wide grid, live tracing and target word list.",
    techFocus_en: "Bilingual 10k-match procedural generation + line detection (horizontal/reverse/vertical/diagonal).",
  },

  // ── Strategy (chess) ───────────────────────────────────────────────────────
  {
    id: "strategy-chess-grandmaster",
    image: chessGrandmasterArenaImage,
    sessionTime: "5-25 min",

    title: "Grandmaster Chess Arena",
    category: "Estrategia",
    tagline: "Ajedrez completo con reglas FIDE, promoción, enroque y tablas reglamentarias.",
    description:
      "Implementación profesional de ajedrez para web: valida legalidad de cada movimiento, incluye capturas al paso, enroque corto/largo, promociones completas y detección de jaque, mate, ahogado y tablas por repetición/material.",
    objective_es: "Pon en jaque mate al rey rival o logra tablas ventajosas aplicando todas las reglas FIDE del ajedrez.",
    howToPlay_es: "Haz clic en una pieza y luego en el destino para mover. U para deshacer, D para reclamar tablas, F alterna pantalla completa.",
    highlights: [
      "IA por dificultad seleccionable al iniciar (Principiante, Intermedio, Avanzado y Experto).",
      "Notación algebraica en histórico de jugadas y resaltado de último movimiento.",
      "Reglas FIDE clave: enroque, captura al paso, promoción y control de jaque legal.",
      "Tablas por material insuficiente, triple/quíntuple repetición y regla 50/75 movimientos.",
      "Puente de QA con render_game_to_text y avance de tiempo determinista.",
    ],
    difficulty: "Variable (4 niveles IA)",
    multiplayer: "Solo vs IA",
    viability: "Alta: motor determinístico con validación legal por posición y bridge QA.",
    visualStyle: "Tablero elegante tipo torneo con panel de jugadas, piezas limpias y foco en legibilidad.",
    techFocus: "Generación de movimientos legales, SAN en español, IA minimax y reglas FIDE de tablas.",

    category_en: "Strategy",
    tagline_en: "Full chess with FIDE rules, promotion, castling and regulatory draws.",
    description_en:
      "Professional web chess implementation: validates legality of every move, includes en passant captures, short/long castling, full promotions and detection of check, checkmate, stalemate and draws by repetition/material.",
    objective_en: "Checkmate the opponent's king or achieve advantageous draws using all FIDE chess rules.",
    howToPlay_en: "Click a piece then click the destination to move. U to undo, D to claim draw, F to toggle fullscreen.",
    highlights_en: [
      "Selectable AI difficulty at start (Beginner, Intermediate, Advanced and Expert).",
      "Algebraic notation in move history and last-move highlight.",
      "Key FIDE rules: castling, en passant, promotion and legal check control.",
      "Draws by insufficient material, triple/quintuple repetition and 50/75 move rule.",
      "QA bridge with render_game_to_text and deterministic time advance.",
    ],
    difficulty_en: "Variable (4 AI levels)",
    multiplayer_en: "Solo vs AI",
    viability_en: "High: deterministic engine with per-position legal validation and QA bridge.",
    visualStyle_en: "Elegant tournament-style board with move panel, clean pieces and readability focus.",
    techFocus_en: "Legal move generation, minimax AI and FIDE draw rules.",
  },

  // ── RPG ────────────────────────────────────────────────────────────────────
  {
    id: "rpg-emberfall",
    image: cardTacticsImage,
    sessionTime: "8-14 min",

    title: "Chronicles of Emberfall",
    category: "RPG",
    tagline: "RPG táctico con botín, contratos, invocación y combate por turnos.",
    description:
      "Asumes el papel de un héroe en una cadena de combates. Gestiona vida, maná, enfoque y santuarios para superar enemigos crecientes, subir de nivel y cerrar la expedición final.",
    objective_es: "Supera todos los encuentros de combate, sube de nivel y completa la expedición final como héroe victorioso.",
    howToPlay_es: "Explora con WASD/flechas. En combate usa atacar, habilidad, defender, enfocar, invocar (U) y poción para superar a cada enemigo por turnos.",
    highlights: [
      "Combate por turnos con acciones ofensivas, defensivas y de enfoque.",
      "Botín de fragmentos y progreso de contrato con bonus persistente.",
      "Santuarios repartidos por mapa para recuperación controlada.",
      "Progresión RPG con enemigos escalados y salida bloqueada por objetivos.",
    ],
    difficulty: "Alta",
    multiplayer: "Solo",
    viability: "Alta: motor por estados con gran trazabilidad de combate.",
    visualStyle: "Fantasía táctica con telemetría RPG y mapa legible por capas.",
    techFocus: "Combate por turnos con contratos, fragmentos de reliquia e invocación.",

    category_en: "RPG",
    tagline_en: "Tactical RPG with loot, contracts, summoning and turn-based combat.",
    description_en:
      "You take the role of a hero in a chain of combats. Manage health, mana, focus and sanctuaries to overcome escalating enemies, level up and close the final expedition.",
    objective_en: "Clear all combat encounters, level up and complete the final expedition as a victorious hero.",
    howToPlay_en: "Explore with WASD/arrows. In combat use attack, skill, defend, focus, summon (U) and potion to defeat each enemy in turn-based fashion.",
    highlights_en: [
      "Turn-based combat with offensive, defensive and focus actions.",
      "Fragment loot and contract progress with persistent bonuses.",
      "Sanctuaries scattered across the map for controlled recovery.",
      "RPG progression with scaled enemies and objective-locked exit.",
    ],
    difficulty_en: "High",
    multiplayer_en: "Solo",
    viability_en: "High: state-based engine with strong combat traceability.",
    visualStyle_en: "Tactical fantasy with RPG telemetry and layered readable map.",
    techFocus_en: "Turn-based combat with contracts, relic fragments and summoning.",
  },

  // ── Knowledge (logic) ──────────────────────────────────────────────────────
  {
    id: "knowledge-logic-vault",
    image: puzzleVaultImage,
    sessionTime: "3-6 min",

    title: "Logic Vault",
    category: "Conocimiento",
    tagline: "Retos de razonamiento rápido para entrenar mente analítica.",
    description:
      "Modo alternativo de conocimiento centrado en patrones y deducción. Complementa al quiz principal para dar variedad dentro de la misma categoría.",
    objective_es: "Resuelve todos los retos de razonamiento de la sesión con el mayor score y racha posibles.",
    howToPlay_es: "Selecciona la respuesta pulsando el botón correspondiente y avanza al bloquear la pregunta.",
    highlights: [
      "Enfoque en razonamiento, no memorización.",
      "Dinámica ideal para sesiones rápidas.",
      "Compatible con futuras expansiones de preguntas.",
    ],
    difficulty: "Media",
    multiplayer: "Solo",
    viability: "Alta: reglas simples con alta rejugabilidad.",
    visualStyle: "Quiz analítico con UI compacta y foco en decisiones rápidas.",
    techFocus: "Rondas de alta variedad temática con scoring estable y trazable.",

    category_en: "Knowledge",
    tagline_en: "Quick reasoning challenges to train your analytical mind.",
    description_en:
      "An alternative knowledge mode focused on patterns and deduction. Complements the main quiz to add variety within the same category.",
    objective_en: "Solve all reasoning challenges in the session with the highest score and streak possible.",
    howToPlay_en: "Select an answer by clicking its button and advance after locking the question.",
    highlights_en: [
      "Focus on reasoning, not memorization.",
      "Ideal dynamic for quick sessions.",
      "Compatible with future question expansions.",
    ],
    difficulty_en: "Medium",
    multiplayer_en: "Solo",
    viability_en: "High: simple rules with high replayability.",
    visualStyle_en: "Analytical quiz with compact UI focused on fast decisions.",
    techFocus_en: "High thematic variety rounds with stable and traceable scoring.",
  },
];
