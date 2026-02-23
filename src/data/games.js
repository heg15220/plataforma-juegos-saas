import neonDriftImage from "../assets/games/neon-drift.svg";
import puzzleVaultImage from "../assets/games/puzzle-vault.svg";
import wordBlitzImage from "../assets/games/word-blitz.svg";
import colonyArchitectImage from "../assets/games/colony-architect.svg";
import rhythmReactorImage from "../assets/games/rhythm-reactor.svg";
import cardTacticsImage from "../assets/games/card-tactics.svg";
import skyRunnerImage from "../assets/games/sky-runner.svg";
import neonDojoImage from "../assets/games/neon-dojo.svg";

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
    tagline: "Plataformas 2D arcade con tiles, patrullas enemigas, power-ups y scroll lateral.",
    category: "Aventura",
    image: skyRunnerImage,
    difficulty: "Media-Alta",
    sessionTime: "3-6 min",
    multiplayer: "Solo",
    viability: "Alta: motor modular Canvas con game loop fijo y colisiones por tiles.",
    visualStyle: "Pixel-art retro con parallax, bloques, tuberias, bandera y HUD clasico.",
    techFocus: "Arquitectura por modulos (input/fisicas/render/entidades/niveles/UI) y avance determinista.",
    description:
      "Vertical slice inspirado en plataformas retro: acelera, frena, salta con altura variable y usa power-ups para superar enemigos en una campana de siete mapas side-scroller.",
    highlights: [
      "Sistema de niveles por tiles cargados desde JSON.",
      "Fisica arcade consistente con coyote time y jump buffer.",
      "IA enemiga de patrulla con reaccion a paredes y bordes.",
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
