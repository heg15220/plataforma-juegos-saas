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
import knowledgeSudokuImage from "../assets/games/knowledge-sudoku.svg";
import knowledgeDominoImage from "../assets/games/knowledge-domino.svg";
import knowledgeAhorcadoImage from "../assets/games/knowledge-ahorcado.svg";
import knowledgePacienciaImage from "../assets/games/knowledge-paciencia.svg";
import knowledgePuzleImage from "../assets/games/knowledge-puzle.svg";
import knowledgeCrucigramaImage from "../assets/games/knowledge-crucigrama.svg";
import knowledgeSopaLetrasImage from "../assets/games/knowledge-sopa-letras.svg";
import chessGrandmasterArenaImage from "../assets/games/chess-grandmaster-arena.svg";

export const games = [
  {
    id: "adventure-echoes",
    title: "Echoes of the Lost Temple",
    tagline: "Aventura arcade tactica con pistas, salto de riesgo y extraccion final.",
    category: "Aventura",
    image: colonyArchitectImage,
    difficulty: "Media-Alta",
    sessionTime: "4-7 min",
    multiplayer: "Solo",
    viability: "Alta: mecanicas por turnos y estado ligero en cliente.",
    visualStyle: "Selva tactica con niebla, capas de escenario y telemetria de amenaza.",
    techFocus: "Director de riesgo, salto tactico tipo action-adventure y escaneo con pistas.",
    description:
      "Aventura de exploracion por casillas donde cada paso importa. Gestiona vida, energia, luz y amenaza mientras rastreas la reliquia oculta y vuelves al campamento base antes de quedarte sin margen.",
    highlights: [
      "Mapa tactico con niebla de guerra y vision extendida por baliza.",
      "Salto tactico temporal para esquivar trampas criticas.",
      "Pistas de distancia/direccion para mantener reto sin frustracion.",
      "Gestion de riesgo con raciones y amenaza dinamica."
    ]
  },
  {
    id: "action-core-strike",
    title: "Core Strike Arena",
    tagline: "Arena shooter por rondas con foco, overdrive y score competitivo.",
    category: "Accion",
    image: rhythmReactorImage,
    difficulty: "Media-Alta",
    sessionTime: "2-4 min",
    multiplayer: "Solo vs IA",
    viability: "Alta: bucle en tiempo real con intervalos controlados.",
    visualStyle: "Arena shooter estilizada con telemetria de combate y amenazas visibles.",
    techFocus: "Formato por rondas, lectura de intencion enemiga, score y gestion de cooldowns.",
    description:
      "Combate intenso contra una IA ofensiva. Debes leer la intencion rival, administrar foco/municion y reaccionar con rapidez para tumbar al enemigo antes de que termine el cronometro de arena.",
    highlights: [
      "Sistema de combate reactivo con overdrive y botiquines limitados.",
      "Tres rondas con escalado de vida enemiga y bonus por tiempo.",
      "Intencion enemiga visible para decisiones tacticas mas limpias.",
      "Partidas cortas con curva de riesgo clara."
    ]
  },
  {
    id: "platformer-sky-runner",
    title: "Sky Runner DX",
    tagline: "Plataformas 2D arcade con rutas aleatorias, mapas verticales y jefes con barra de vida.",
    category: "Aventura",
    image: skyRunnerImage,
    difficulty: "Media-Alta",
    sessionTime: "3-6 min",
    multiplayer: "Solo",
    viability: "Alta: motor modular Canvas con game loop fijo y colisiones por tiles.",
    visualStyle: "Pixel-art retro con direccion scratch-like, parallax multicapa y HUD de jefe en combate.",
    techFocus: "Arquitectura modular con campaña aleatoria de 5 mapas, layouts mixtos y sistema de boss fight.",
    description:
      "Run arcade inspirado en plataformas retro: cada partida mezcla 5 mapas aleatorios (horizontales, verticales e hibridos), incluye al menos dos encuentros contra jefe y cierra siempre con un jefe final.",
    highlights: [
      "Campana procedural corta: 5 mapas por run con orden aleatorio.",
      "Mapas de escalada vertical y rutas hibridas ademas de side-scroll clasico.",
      "Dos encuentros de jefe por partida con barra de vida y fases de dano.",
      "Fisica arcade consistente con coyote time y jump buffer.",
      "IA enemiga de patrulla + jefe con comportamiento ofensivo.",
      "Power-up de fuego para derrotar enemigos a distancia.",
      "Estado QA exportado para automatizacion de pruebas."
    ]
  },
  {
    id: "fighter-neon-dojo",
    title: "Neon Dojo Clash",
    tagline: "Fighting 2D con guardia, combos, medidor y rival IA.",
    category: "Accion",
    image: neonDojoImage,
    difficulty: "Alta",
    sessionTime: "2-5 min",
    multiplayer: "Solo vs IA",
    viability: "Alta: loop en tiempo real con hitbox logica e input buffer.",
    visualStyle: "Arena neon de combate con luchadores humanos animados por estado.",
    techFocus: "State machine de lucha, ventana de ataques y audio por hit/block/KO.",
    description:
      "Combate 1v1 enfocado en fundamentos de fighting games: confirmar golpes, gestionar guardia y decidir cuando gastar meter en un special de alto impacto.",
    highlights: [
      "Ataques light/heavy/special con startup/active/recovery.",
      "Guardia con ruptura y castigo por sobreuso.",
      "Input buffer para confirmar secuencias cortas de combo.",
      "IA reactiva que ajusta distancia y eleccion de ataque.",
      "Feedback audiovisual de impacto, bloqueo y ruptura de guardia."
    ]
  },
  {
    id: "arcade-pacman-maze-protocol",
    title: "Pac-Man Maze Protocol",
    tagline: "Arcade de laberinto con persecucion, pellets, power mode y FSM de fantasmas.",
    category: "Arcade",
    image: pacmanMazeProtocolImage,
    difficulty: "Media-Alta",
    sessionTime: "4-9 min",
    multiplayer: "Solo",
    viability: "Alta: motor Canvas 2D desacoplado con IA por estados y pathfinding BFS.",
    visualStyle: "Laberinto neon oscuro con lectura clara de rutas, pellets y estados de fantasmas.",
    techFocus: "Arquitectura modular engine/world/entities/ai/state + HUD React desacoplado.",
    description:
      "Version completa de Pac-Man con mapa por tiles, tuneles laterales, 4 fantasmas con comportamientos diferenciados, sistema de vidas/puntuacion/niveles y modo debug para validar IA y colisiones.",
    highlights: [
      "FSM de fantasmas con modos scatter, chase, frightened y eaten.",
      "Targeting fiel: Blinky/Pinky/Inky/Clyde con reglas distintas.",
      "Power pellets con bonus de fantasmas encadenado (200/400/800/1600).",
      "Loop fijo 60 ticks + render Canvas y puente QA render_game_to_text.",
      "HUD con score, high score persistente, vidas, nivel y metricas de frame."
    ]
  },
  {
    id: "sports-head-soccer-arena",
    title: "Head Soccer Arena X",
    tagline: "Futbol 1v1 arcade con poderes, IA escalable y estadios animados.",
    category: "Deportes",
    image: headSoccerArenaImage,
    difficulty: "Media-Alta",
    sessionTime: "3-6 min",
    multiplayer: "Solo vs IA",
    viability: "Alta: motor Canvas 2D con fisica arcade, colisiones y habilidades por cooldown.",
    visualStyle: "Cartoon cabezon, estadios dia/noche/futuro y VFX de impacto/fuego.",
    techFocus: "Loop fijo update-physics-render, IA por dificultad y estado QA determinista.",
    description:
      "Partidos rapidos 1v1 con controles directos y game feel exagerado. Marca mas goles que la CPU usando cabezazos, disparos, salto arcade y una habilidad especial por personaje.",
    highlights: [
      "Movimiento lateral, salto, disparo y celebracion por gol.",
      "Balon elastico con rebotes fuertes, estela de fuego y particulas.",
      "Habilidades unicas: fuego, congelar, super salto y mega tamano.",
      "IA arcade con tres dificultades y reaccion contextual al balon.",
      "HUD completo: marcador, energia de habilidad, temporizador y eventos."
    ]
  },
  {
    id: "racing-neon-lanes",
    title: "Neon Lanes Rush",
    tagline: "Carreras arcade por carril con clima, near-miss, turbo y cajas de item.",
    category: "Carreras",
    image: neonDriftImage,
    difficulty: "Media",
    sessionTime: "2-5 min",
    multiplayer: "Solo",
    viability: "Alta: motor Phaser en canvas con loop determinista y telemetria QA.",
    visualStyle: "Arcade racing con HUD competitivo, scroll de pista y estados climaticos visibles.",
    techFocus: "Loop Phaser por ticks, cadena near-miss y sistema de items ofensivo/defensivo.",
    description:
      "Juego de carreras arcade centrado en reflejos. Cambia de carril para evitar obstaculos, adapta tu conduccion al clima y completa la distancia objetivo maximizando near-miss y turbo.",
    highlights: [
      "Control rapido con teclado o botones tactiles.",
      "Renderizado en canvas con motor Phaser y estado serializable.",
      "Cajas de item con Pulso EMP o kit de reparacion.",
      "Escudo de recuperacion para evitar derrotas injustas.",
      "Clima y estabilidad que cambian el ritmo de carrera."
    ]
  },
  {
    id: "knowledge-quiz-nexus",
    title: "Quiz Nexus",
    tagline: "Rondas de conocimiento con limite de tiempo por pregunta.",
    category: "Conocimiento",
    image: wordBlitzImage,
    difficulty: "Baja-Media",
    sessionTime: "4-8 min",
    multiplayer: "Solo",
    viability: "Alta: banco masivo local con i18n por idioma de navegador.",
    visualStyle: "Panel quiz premium con identidad neon y lectura rapida de feedback.",
    techFocus: "Seleccion balanceada por topicos, i18n es/en y puntuacion por racha.",
    description:
      "Juego de preguntas por bloques tematicos con feedback inmediato. Combina rapidez y precision para acumular puntos y cerrar la sesion con rango experto.",
    highlights: [
      "Banco de preguntas reutilizable y ampliable (>10k).",
      "Cambio automatico de idioma: navegador es -> espanol; resto -> ingles.",
      "Temporizador por ronda para aumentar desafio.",
      "Sistema de puntuacion y ranking final."
    ]
  },
  {
    id: "knowledge-sudoku-sprint",
    title: "Sudoku Sprint 4x4",
    tagline: "Sudoku de resolucion rapida con validacion inmediata y control por teclado.",
    category: "Conocimiento",
    image: knowledgeSudokuImage,
    difficulty: "Media",
    sessionTime: "3-7 min",
    multiplayer: "Solo",
    viability: "Alta: logica determinista y estado compacto 100% cliente.",
    visualStyle: "Panel oscuro premium con rejilla 4x4 y feedback de conflictos.",
    techFocus: "Validacion de fila/columna/bloque + bridge QA de estado serializable.",
    description:
      "Modo de agilidad mental en formato Sudoku 4x4. Rellena celdas sin repetir numeros y completa el tablero con cero conflictos.",
    highlights: [
      "Seleccion de celda por raton o flechas.",
      "Entrada numerica por teclas 1-4 y atajos A/S/D/F.",
      "Deteccion de conflictos en tiempo real.",
      "Payload QA con tablero, seleccion y estado de resolucion."
    ]
  },
  {
    id: "knowledge-domino-chain",
    title: "Domino Clasico Arena",
    tagline: "Domino completo por rondas con tranca, puntuacion y rival IA configurable.",
    category: "Estrategia",
    image: knowledgeDominoImage,
    difficulty: "Variable (Facil/Media/Dificil)",
    sessionTime: "6-18 min",
    multiplayer: "Solo vs IA",
    viability: "Alta: reglas discretas, IA heuristica/minimax y estado serializable para QA.",
    visualStyle: "Mesa estrategica con lectura clara de extremos, manos y marcador por ronda.",
    techFocus: "Motor completo de rondas con tranca, scoring acumulado e IA multi-nivel.",
    description:
      "Implementacion completa del domino clasico (doble-seis) en modo estrategia: salida por ficha alta, turnos con jugadas legales, pases, cierre por tranca, puntuacion por rondas y victoria global por objetivo de puntos.",
    highlights: [
      "IA por dificultad: facil (aleatoria), media (heuristica) y dificil (minimax).",
      "Reglas de dominio y tranca con recuento de puntos en mano.",
      "Partida multi-ronda con objetivo configurable y resumen de cierre.",
      "Panel de reglas integrado con prompt completo y bridge QA."
    ]
  },
  {
    id: "knowledge-ahorcado-flash",
    title: "Ahorcado Flash",
    tagline: "Adivina palabras con pista tematica y limite de fallos.",
    category: "Conocimiento",
    image: knowledgeAhorcadoImage,
    difficulty: "Baja-Media",
    sessionTime: "2-4 min",
    multiplayer: "Solo",
    viability: "Alta: conjunto acotado de palabras, flujo simple y rejugable.",
    visualStyle: "Interfaz neon con barra de progreso de errores y teclado virtual.",
    techFocus: "Entrada por teclado global, mascara de palabra y gestion de intentos.",
    description:
      "Juego clasico de palabras: usa las pistas y acierta letras antes de perder todos los intentos disponibles.",
    highlights: [
      "Diccionario tematico orientado a conocimiento general.",
      "Teclado virtual + input fisico.",
      "Cambio de palabra al reiniciar para variar partidas.",
      "Bridge QA con mascara, letras usadas e intentos restantes."
    ]
  },
  {
    id: "knowledge-paciencia-lite",
    title: "Paciencia Clasica Lite",
    tagline: "Solitario compacto con stock, descarte y fundaciones por palo.",
    category: "Conocimiento",
    image: knowledgePacienciaImage,
    difficulty: "Media-Alta",
    sessionTime: "4-8 min",
    multiplayer: "Solo",
    viability: "Alta: motor de reglas discreto sin dependencias externas.",
    visualStyle: "Mesa de cartas minimalista con estados de seleccion y destino.",
    techFocus: "Reglas de movimiento tipo solitario + progresion por fundaciones.",
    description:
      "Version ligera de paciencia: roba cartas, organiza columnas y construye fundaciones de As a 7 para ganar la ronda.",
    highlights: [
      "Stock/descarte con reciclado cuando se agota el mazo.",
      "Fundaciones por palo con progreso visible.",
      "Destino de columna controlado por teclado y UI.",
      "Auto-seleccion a fundacion para acelerar flujo."
    ]
  },
  {
    id: "knowledge-puzle-deslizante",
    title: "Puzle Deslizante 8",
    tagline: "Ordena fichas del 1 al 8 moviendo el hueco vacio.",
    category: "Conocimiento",
    image: knowledgePuzleImage,
    difficulty: "Media",
    sessionTime: "2-6 min",
    multiplayer: "Solo",
    viability: "Alta: algoritmo de swap simple y estado totalmente determinista.",
    visualStyle: "Grid 3x3 limpio con foco en legibilidad y ritmo rapido.",
    techFocus: "Movimientos por flechas/click y verificacion instantanea de solucion.",
    description:
      "Puzzle numerico clasico de 8 piezas. Mueve las fichas adyacentes para ordenar la secuencia completa.",
    highlights: [
      "Control dual: teclado y raton.",
      "Conteo de movimientos por partida.",
      "Finalizacion automatica al detectar secuencia correcta.",
      "Payload QA con posicion exacta de cada ficha."
    ]
  },
  {
    id: "knowledge-crucigrama-mini",
    title: "Crucigrama Mini",
    tagline: "Crucigrama compacto con pistas horizontales y verticales.",
    category: "Conocimiento",
    image: knowledgeCrucigramaImage,
    difficulty: "Media",
    sessionTime: "4-9 min",
    multiplayer: "Solo",
    viability: "Alta: rejilla fija de bajo coste y validacion por comparacion directa.",
    visualStyle: "Panel de letras con celdas bloqueadas y listado de pistas lateral.",
    techFocus: "Edicion celda a celda, navegacion por flechas y comprobacion de solucion.",
    description:
      "Rellena una rejilla de crucigrama mini siguiendo pistas. El juego valida progreso y permite comprobar resultados en cualquier momento.",
    highlights: [
      "Casillas bloqueadas y seleccion activa visible.",
      "Escritura por teclado con retroceso y desplazamiento.",
      "Boton de comprobacion para detectar errores.",
      "Bridge QA con rejilla editable completa."
    ]
  },
  {
    id: "knowledge-sopa-letras-mega",
    title: "Sopa de Letras Mega",
    tagline: "Tablero grande 20x20 con 10.000 partidas ES/EN y palabras en 8 direcciones.",
    category: "Conocimiento",
    image: knowledgeSopaLetrasImage,
    difficulty: "Media",
    sessionTime: "4-10 min",
    multiplayer: "Solo",
    viability: "Alta: generador determinista por semilla, estado ligero y validacion directa por trazado.",
    visualStyle: "Panel premium de letras con rejilla amplia, trazado en vivo y listado de objetivos.",
    techFocus: "Generacion procedural bilingue de 10k partidas + deteccion de lineas (horizontal/reversa/vertical/diagonal).",
    description:
      "Encuentra palabras de conocimiento general dentro de una rejilla grande. Cada partida cambia de forma determinista y permite localizar palabras en horizontal, vertical o diagonal, tanto en sentido normal como al reves.",
    highlights: [
      "Tablero grande 20x20 para sesiones de busqueda mas largas.",
      "10.000 combinaciones por idioma (es/en) segun locale del navegador.",
      "Seleccion por arrastre o click inicio-fin con soporte de direccion inversa.",
      "Palabras reales de ciencia, historia, lenguaje, salud y cultura.",
      "Bridge QA con estado serializado de progreso y palabras pendientes."
    ]
  },
  {
    id: "strategy-chess-grandmaster",
    title: "Grandmaster Chess Arena",
    tagline: "Ajedrez completo con reglas FIDE, promocion, enroque y tablas reglamentarias.",
    category: "Estrategia",
    image: chessGrandmasterArenaImage,
    difficulty: "Variable (4 niveles IA)",
    sessionTime: "5-25 min",
    multiplayer: "Solo vs IA",
    viability: "Alta: motor deterministico con validacion legal por posicion y bridge QA.",
    visualStyle: "Tablero elegante tipo torneo con panel de jugadas, piezas limpias y foco en legibilidad.",
    techFocus: "Generacion de movimientos legales, SAN en espanol, IA minimax y reglas FIDE de tablas.",
    description:
      "Implementacion profesional de ajedrez para web: valida legalidad de cada movimiento, incluye capturas al paso, enroque corto/largo, promociones completas y deteccion de jaque, mate, ahogado y tablas por repeticion/material.",
    highlights: [
      "IA por dificultad seleccionable al iniciar (Principiante, Intermedio, Avanzado y Experto).",
      "Notacion algebraica en historico de jugadas y resaltado de ultimo movimiento.",
      "Reglas FIDE clave: enroque, captura al paso, promocion y control de jaque legal.",
      "Tablas por material insuficiente, triple/quintuple repeticion y regla 50/75 movimientos.",
      "Puente de QA con render_game_to_text y avance de tiempo determinista."
    ]
  },
  {
    id: "rpg-emberfall",
    title: "Chronicles of Emberfall",
    tagline: "RPG tactico con botin, contratos, invocacion y combate por turnos.",
    category: "RPG",
    image: cardTacticsImage,
    difficulty: "Alta",
    sessionTime: "8-14 min",
    multiplayer: "Solo",
    viability: "Alta: motor por estados con gran trazabilidad de combate.",
    visualStyle: "Fantasia tactica con telemetria RPG y mapa legible por capas.",
    techFocus: "Combate por turnos con contratos, fragmentos de reliquia e invocacion.",
    description:
      "Asumes el papel de un heroe en una cadena de combates. Gestiona vida, mana, enfoque y santuarios para superar enemigos crecientes, subir de nivel y cerrar la expedicion final.",
    highlights: [
      "Combate por turnos con acciones ofensivas, defensivas y de enfoque.",
      "Botin de fragmentos y progreso de contrato con bonus persistente.",
      "Santuarios repartidos por mapa para recuperacion controlada.",
      "Progresion RPG con enemigos escalados y salida bloqueada por objetivos."
    ]
  },
  {
    id: "knowledge-logic-vault",
    title: "Logic Vault",
    tagline: "Retos de razonamiento rapido para entrenar mente analitica.",
    category: "Conocimiento",
    image: puzzleVaultImage,
    difficulty: "Media",
    sessionTime: "3-6 min",
    multiplayer: "Solo",
    viability: "Alta: reglas simples con alta rejugabilidad.",
    visualStyle: "Quiz analitico con UI compacta y foco en decisiones rapidas.",
    techFocus: "Rondas de alta variedad tematica con scoring estable y trazable.",
    description:
      "Modo alternativo de conocimiento centrado en patrones y deduccion. Complementa al quiz principal para dar variedad dentro de la misma categoria.",
    highlights: [
      "Enfoque en razonamiento, no memorizacion.",
      "Dinamica ideal para sesiones rapidas.",
      "Compatible con futuras expansiones de preguntas."
    ]
  }
];

