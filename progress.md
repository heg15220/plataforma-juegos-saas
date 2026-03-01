Original prompt: [Image #1] [Image #2] [Image #3] [Image #4] Utiliza estas imagenes como ayuda y referencia para profesionalizar y mejorar tecnicamente y graficamente los juegos de las distintas categorias de plataforma-juegos-saas.

## 2026-02-22 - Inicio
- Revisado el estado actual del proyecto React/Vite y de todos los minijuegos.
- Detectadas oportunidades: mejorar direccion artistica por categoria, HUD y telemetria, consistencia UI y hooks de test (`render_game_to_text` + `advanceTime`).
- Siguiente bloque: implementar mejoras visuales/tacticas y trazabilidad tecnica del estado del juego activo.

## 2026-02-22 - Implementacion principal
- Creada utilidad comun `src/utils/useGameRuntimeBridge.js` para publicar `window.render_game_to_text` y `window.advanceTime`.
- Rehechos motores de `AdventureGame`, `ActionGame`, `RacingGame`, `KnowledgeGame` y `RpgGame` con mejoras tecnicas y de UX:
  - aventura: recursos de luz/escaneo y progreso de extraccion;
  - accion: shooter tactico con municion, cohetes, recarga y lineas de tiro;
  - carreras: HUD competitivo (posicion/vuelta/velocidad/turbo), trafico rival y progresion por vueltas;
  - conocimiento: scoring por puntos/racha/precision;
  - RPG: intencion enemiga y progreso de objetivo.
- Actualizada la capa SaaS (home/detail/playground + CSS) con direccion visual por categoria y mejoras de presentacion.
- Pendiente: ejecutar build y validacion automatizada Playwright de la skill.

## 2026-02-22 - Expansion banco de preguntas (conocimiento)
- Se amplio `src/data/questionBank.js` hasta `10663` preguntas totales, cubriendo categorias existentes y nuevas (`Astronomia`, `Salud`, `Gastronomia`, `Logica`).
- Se corrigio la redaccion de prompts para eliminar prefijos tipo `Categoria N:`/`Numero de pregunta`.
- Validado por script que no quedan prompts con ese formato y que el banco mantiene volumen > 10k.
- Build verificado con `npm run build`.
- Pendiente: ejecutar pasada Playwright especifica del modo conocimiento (el intento previo se interrumpio manualmente).
## 2026-02-22 - Profesionalizacion categorias no conocimiento
- `AdventureGame` rehecho con director de amenaza, pistas de reliquia por distancia/direccion y nuevas acciones de supervivencia (`racion`, `baliza`).
- `ActionGame` rehecho con intencion enemiga visible, medidor de foco, habilidad `overdrive` y `botiquin` con cooldown.
- `RacingGame` rehecho con climatologia dinamica (`seco/lluvia/crepusculo`), cadena `near-miss`, escudo de impacto y modo `estabilizar`.
- `RpgGame` rehecho con santuarios de ruta, enfoque acumulable para habilidades y escalado moderado de encuentros.
- Nuevos sprites: `beacon.svg` y `shrine.svg`; actualizado `styles.css` para nuevos estados visuales y animaciones.
- Ajustadas descripciones tecnicas/UX en `src/data/games.js` y pistas de control en `GamePlayground`.

## 2026-02-22 - Upgrade plataforma + fighting (realismo + audio)
- Reescrito `PlatformerGame` con personajes humanos dibujados en canvas y poses por mecanica (`idle/run/jump/dash/hurt`).
- AÃ±adido audio sintetizado por evento en plataformas: salto, dash, moneda, pisoton, dano, denegado en meta, victoria/derrota.
- Mejorado escenario de plataformas con fondo multicapa (cielo degradado, montanas y profundidad).
- Reescrito `FighterGame` con luchadores humanos, poses por estado (`idle/move/jump/guard/light/heavy/special/stunned/ko`) y feedback visual de impacto.
- AÃ±adido audio sintetizado en lucha: ataque, hit, block, guard break, salto, ko y empate.
- Incluidas teclas alternativas para pruebas automÃ¡ticas en fighting (`space` jab, `enter` heavy, `B` special).
- Actualizados textos de control y fichas de juego para reflejar el nuevo enfoque audiovisual.
- Pendiente: validar build y ejecutar bucles Playwright de plataforma y fighting con inspeccion de screenshots/estado.

## 2026-02-23 - Rebuild completo de plataformas (motor modular)
- Reemplazado `src/games/PlatformerGame.jsx` por una integracion Canvas propia (sin scene monolitica), con HUD, pantalla de inicio y controles tactiles/teclado.
- Nueva arquitectura modular bajo `src/games/platformer/`:
  - `core/PlatformerEngine.js` (game loop fijo, estados de partida, camara, progreso de niveles).
  - `input/InputController.js` (teclado + gamepad + controles virtuales).
  - `physics/collision.js` (colisiones por tiles, one-way platforms, AABB).
  - `entities/*` (player, enemy, item, projectile).
  - `levels/*` (carga de mapas JSON y runtime loader).
  - `render/Renderer.js` (pixel-art retro, parallax, HUD y overlays de estado).
  - `audio/ArcadeAudio.js` (FX sintetizados para salto, moneda, dano, disparo, victoria, derrota).
  - `ui/hudModel.js` (snapshot para UI + `render_game_to_text`).
- Anadidos dos niveles side-scroller (`level-1.json`, `level-2.json`) con tiles, bloques especiales, tuberias, enemigos patrulla, monedas y power-ups.
- Actualizados metadatos/controles de la plataforma (`src/data/games.js`, `src/components/GamePlayground.jsx`) para reflejar nuevas mecanicas.
- Documentacion nueva: `docs/platformer-arcade-architecture.md` (arquitectura, game loop, estructura y extension de niveles/enemigos).
- Pendiente inmediato: ejecutar build y bucle Playwright del skill, revisar screenshots/estado y corregir defects.

## 2026-02-23 - Ajuste de cierre por bandera + expansion de mapas
- Confirmada logica de final de nivel por bandera: las monedas son opcionales y solo aportan bonus de puntuacion.
- Anadido soporte explicito en loader/engine para `goalRequiresAllCoins` (default `false`) para evitar bloqueos por monedas.
- Incorporados 5 mapas nuevos (`level-3.json` a `level-7.json`) y registrados en `levels/index.js`.
- La campana ahora avanza de forma secuencial por 7 niveles; cada nivel se desbloquea al completar el anterior.
- Actualizados textos de producto/render para reflejar la nueva duracion de campana.
- Pendiente: build + Playwright de regresion tras expansion de niveles.

- Anadido `HeadSoccerGame.jsx` con futbol 1v1 arcade: movimiento/salto/disparo, goles, marcador, timer, IA por dificultad, habilidades con cooldown, VFX y audio sintetizado.
- Integrados ambos juegos en catalogo y playground (`src/data/games.js`, `src/components/GamePlayground.jsx`).
- Estilos extendidos en `src/styles.css` para HUD, paneles de configuracion y controles tactiles/desktop.
- Pendiente inmediato: build + ronda Playwright con inspeccion de screenshots/estado y ajuste de defects.

- Ejecutada ronda Playwright para ambos juegos con capturas y estado QA:
  - `output/head-soccer-audit/shot-0..2.png` + `state-0..2.json`
- Confirmado: sin errores de consola en la pasada automatizada.
- Detectados gaps principales de producto:
  - Head Soccer: falta de dash/charge/momentum, IA sin personalidades, expresividad visual limitada y ausencia de metaprogresion.
  - diagnostico por juego,
  - backlog priorizado P0/P1/P2,
  - plan UX/accesibilidad/KPIs,
  - prompt maestro reutilizable para futuras iteraciones.
  - arquitectura objetivo por modulos (`physics`, `camera`, `ai`, `render`, `fx`, `hud`, `content`);
  - roadmap por fases P0/P1/P2/P3 con criterios de salida;
  - pipeline de assets 3D y estrategia LOD/rendimiento;
  - evolucion de gameplay (peso/inercia/drift/colisiones/IA por personalidad);
  - evolucion visual (PBR, damage progresivo, iluminacion, VFX, HUD inmersivo).
- Incluidas quick wins de corto plazo sobre el runtime actual para mantener iteracion mientras se migra a 3D real.

  - `core/EventBus.js` (bus de eventos desacoplado),
  - `camera/CameraEffects.js` (shake/terrain bob),
  - `camera/ChaseCameraRig.js` (camara modular con FOV dinamico),
  - `advanceTime(ms)` ahora usa runtime determinista,
  - camera context conectado (speed/maxSpeed/lane/airborne/damage),
  - render usando estado de camara modular (offset/FOV/shake).
- Build validado: `npm run build` (OK).
- Pendiente sugerido P1: extraer fisicas/IA a modulos dedicados (`physics/`, `ai/`) y separar renderer HUD/escena.

## 2026-02-23 - P1 tecnico (extraccion IA + fisicas a modulos)
  - `updateAi` ahora vive fuera del componente y se configura por inyeccion de dependencias (track/cars/roles/math).
  - Incluye `createState`, `updateRace`, `toSnapshot`, colisiones, atajos, overheat, progreso por vuelta y serializacion.
  - importa `createRaceSystems`,
  - elimina logica monolitica de IA/fisicas,
  - mantiene UI/HUD/canvas y runtime bridge.
- Validacion completada:
  - Build: `npm run build` OK.
- Pendiente P1.1 recomendado: mover config de coches/pistas/dificultad a `content/` para reutilizacion con futuro renderer 3D.

  - `DIFFICULTY`, `TRACKS`, `CARS`, `AI_ROLES`, `AI_ROLE_CYCLE`.
  - `gearIndexFromSpeed`, `trackCurve`.
- Render separado en modulos dedicados:
  - delega dibujo a Scene/HUD renderers,
  - mantiene runtime/input/bridge QA en capa de integracion.
- Validacion completada:
  - Build: `npm run build` OK.
- Pendiente sugerido P2 tecnico: extraer audio a `audio/` y dividir HUD React vs HUD canvas para iterar UX mas rapido.

  - comportamiento impredecible en `ai/createAiSystem.js` (cambios de trazada/ritmo mas bruscos).
  - zonas `front/rear/left/right`,
  - total damage derivado de zonas,
  - colisiones coche/coche, muro y atajos ahora aplican dano zonal,
  - penalizacion de direccion y sesgo de volante segun zona danada,
  - nuevas alertas de estado (`damage/handling/heat`).
- HUD y visual actualizados:
  - `hud/HudRenderer.js` muestra mapa de dano por zonas + chips de alerta critica/warning,
  - `render/SceneRenderer.js` anade marcas visuales basicas por zona danada en el coche,
- Validacion completada:
  - Build OK: `npm run build`.
  - Sin `errors-*.json` en ambos runs.

## 2026-02-23 - Cierre de faltantes (arquitectura + integracion sistemas)
- Integrada `RACING_LINES` real por circuito desde `content/racingLines/*.json` en el pipeline de IA:
  - `physics/createRaceSystems.js` recibe y propaga `RACING_LINES`.
  - `ai/createAiSystem.js` prioriza las lineas de contenido y usa fallback procedural solo si faltan datos.
- `render3d/SceneBuilder.jsx` reforzado:
  - colision de camara activa via `camera/CameraCollisionSolver` + raycast Rapier;
  - integracion de `render/SkidDecalSystem` con generacion de marcas por slip;
- `render/CarRenderer.jsx` ahora soporta dano zonal (objeto) ademas de dano total numerico.
- `post/PostProcessingStack.jsx` ajustado para low tier con bloom minimo y fix de prop `multisampling`.

- Se detecto regression visual tras integrar camera collision/shell de experiencia: capturas con fondo casi negro y `physicsVehicle` con nulls en estado QA.
- Correcciones aplicadas:
  - guardas de valores no finitos + reset seguro en `physics3d/ArcadeVehicleController.jsx`;
  - fallback de camara ante valores invalidos en `render3d/SceneBuilder.jsx`;
  - sanitizacion numerica en `qa/buildTextPayload.js` para evitar null por NaN/Infinity.
- Build verificado (OK).
  - capturas `shot-0..2.png` visibles con pista/hud;
  - estado `state-2.json` con `physicsVehicle` numerico;
  - sin `errors-*.json`.
- Estado actual: bloque de faltantes solicitado implementado e integrado en runtime principal con QA operativo.

## 2026-02-23 - Nuevos juegos de conocimiento implementados (Sudoku, Domino, Ahorcado, Paciencia, Puzle, Crucigrama)
- Nuevo motor modular `KnowledgeArcadeGame` con variantes jugables:
  - `sudoku` (`src/games/knowledge/SudokuKnowledgeGame.jsx`)
  - `domino` (`src/games/knowledge/DominoKnowledgeGame.jsx`)
  - `ahorcado` (`src/games/knowledge/HangmanKnowledgeGame.jsx`)
  - `paciencia` (`src/games/knowledge/SolitaireKnowledgeGame.jsx`)
  - `puzle` (`src/games/knowledge/PuzzleKnowledgeGame.jsx`)
  - `crucigrama` (`src/games/knowledge/CrosswordKnowledgeGame.jsx`)
- Integracion en playground/catalogo:
  - `src/components/GamePlayground.jsx` actualizado con nuevos IDs, mapeo de componentes e instrucciones de control.
  - `src/data/games.js` ampliado con seis fichas nuevas dentro de la categoria `Conocimiento`.
- Portadas nuevas para los seis juegos en `src/assets/games/`:
  - `knowledge-sudoku.svg`, `knowledge-domino.svg`, `knowledge-ahorcado.svg`,
  - `knowledge-paciencia.svg`, `knowledge-puzle.svg`, `knowledge-crucigrama.svg`.
- Estilos ampliados en `src/styles.css` para UI dedicada (rejillas, cartas, teclado de letras, domino chain, crucigrama) y responsive movil.
- Pendiente inmediato: build + validacion Playwright con capturas/estado para cada variante nueva.

## 2026-02-24 - Rediseno UX/UI de juegos de conocimiento (excepto Quiz)
- Redisenados estilos y layouts de `knowledge-arcade` para dar identidad real de juego por variante sin tocar `KnowledgeGame` (Quiz).
- Ahorcado: nueva escena de horca completa con piezas del muneco por fallo, panel de letras falladas y slots de palabra tipo casilla.
- Domino: fichas visuales con pips (0-6), cadena en tapete, extremos activos resaltados y mano mas legible.
- Sudoku: tablero con marco y separaciones de bloque 2x2, celdas mejoradas y feedback visual claro para fijas/seleccion/conflicto.
- Paciencia: mesa de cartas, cartas con rank+suit en esquinas/centro y mejor jerarquia visual en columnas/fundaciones/destino.
- Puzle: tablero enmarcado, fichas con relieve visual y estado `aligned` para piezas en posicion correcta.
- Crucigrama: celdas numeradas como crucigrama real, estilo de papel + bloques oscuros y panel de pistas mejorado.
- Validacion tecnica: `npm run build` OK (se ejecuto fuera de sandbox por `spawn EPERM` de esbuild).
- QA automatizado: rondas Playwright en `output/knowledge-style-*` sin `errors-*.json` y estados serializados correctos.
- QA visual adicional enfocada al playground: capturas en `output/knowledge-style-review/*.png` para las 6 variantes redisenadas.

## 2026-02-24 - 10k partidas + i18n en conocimiento (sin Quiz)
- Anadida utilidad compartida `src/games/knowledge/knowledgeArcadeUtils.js` con:
  - selector de locale (`es` si navegador es espanol, `en` en otro caso),
  - control de `matchId` en rango `0..9999`,
  - RNG determinista y helpers de barajado/codificacion.
- Refactorizados los 6 juegos de conocimiento no-Quiz para usar partidas semilla e i18n ES/EN:
  - `SudokuKnowledgeGame.jsx`: generacion determinista (transformaciones + mascaras) y `10000` combinaciones.
  - `DominoKnowledgeGame.jsx`: cadena/mano inicial generada por `matchId` con estado serializado `match.current/total`.
  - `HangmanKnowledgeGame.jsx`: palabras generadas por combinacion `25x20x20 = 10000` por locale.
  - `SolitaireKnowledgeGame.jsx`: reparto determinista por `matchId` via unranking de permutacion del mazo.
  - `PuzzleKnowledgeGame.jsx`: catalogo determinista de 10k tableros resolubles (BFS sobre estados validos).
  - `CrosswordKnowledgeGame.jsx`: rejilla/pistas dinamicas por `matchId` con clues localizadas.
- En los 6 juegos se incorporo:
  - boton de reinicio como "siguiente partida" (incrementa `matchId`),
  - payload QA con `locale` y `match` (`current`, `total=10000`),
  - textos de UI/mensajes en espanol o ingles segun navegador.
- `GamePlayground.jsx` actualizado con copy ES/EN para encabezado/hints/cargas y fallback de hints por locale.
- Validacion tecnica:
  - Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild).
  - QA Playwright ejecutada para 6 juegos de conocimiento no-Quiz en:
    - `output/knowledge-10k-sudoku/`
    - `output/knowledge-10k-domino/`
    - `output/knowledge-10k-ahorcado/`
    - `output/knowledge-10k-paciencia/`
    - `output/knowledge-10k-puzle/`
    - `output/knowledge-10k-crucigrama/`
  - Generadas capturas `shot-0..2.png` y estados `state-0..2.json` en cada carpeta.
  - Sin archivos `errors-*.json` en esa ronda.
- Fix adicional post-QA: `GamePlayground.jsx` ajustado para cumplir reglas de hooks (locale `useMemo` antes de retorno temprano cuando `game` es null).
- Build revalidado OK y ronda Playwright de los 6 juegos repetida tras el fix, manteniendo capturas/estados y sin `errors-*.json`.
## 2026-02-24 - Mejora de pistas (ahorcado/crucigrama) + partidas aleatorias en Conocimiento (sin Quiz)
- `HangmanKnowledgeGame.jsx`:
  - Sustituido generador de pseudo-palabras por banco curado ES/EN con palabras reales y pistas semanticas.
  - Texto del boton actualizado a `Partida aleatoria` / `Random match`.
  - Reinicio ahora usa `getRandomKnowledgeMatchIdExcept(...)` para evitar secuencia lineal.
  - Limpieza de atajo `r` no operativo en teclado (evita conflicto con letra valida en ahorcado).
- `CrosswordKnowledgeGame.jsx`:
  - Eliminadas pistas tipo anagrama sintetico.
  - Nuevo banco de crucigramas ES/EN con plantillas validas y definiciones reales (horizontales/verticales).
  - Texto del boton actualizado a `Partida aleatoria` / `Random match`.
  - Reinicio ahora usa `getRandomKnowledgeMatchIdExcept(...)`.
  - Limpieza de atajo `r` no operativo (conflicto con entrada de letras).
- Juegos de Conocimiento no-Quiz con reinicio aleatorio:
  - `SudokuKnowledgeGame.jsx`, `DominoKnowledgeGame.jsx`, `PuzzleKnowledgeGame.jsx`, `SolitaireKnowledgeGame.jsx` migrados de `getNextKnowledgeMatchId(...)` a `getRandomKnowledgeMatchIdExcept(...)`.
  - Textos de boton de reinicio cambiados de `Siguiente partida` / `Next match` a `Partida aleatoria` / `Random match`.
- Utilidad comun:
  - `knowledgeArcadeUtils.js`: anadido helper `getRandomKnowledgeMatchIdExcept(matchId)`.
- Copy de ayuda:
  - `GamePlayground.jsx`: hints actualizados para reflejar el flujo aleatorio; en ahorcado/crucigrama se indica boton de partida aleatoria (sin shortcut de letra conflictiva).

### Validacion
- Build: `npm run build` OK (ejecucion fuera de sandbox por EPERM de esbuild en sandbox).
- Playwright (final, focalizado):
  - `output/knowledge-final-ahorcado/` -> estado serializado con `variant: ahorcado` y pista real (`Instrumento para orientarse con el norte magnetico.`).
  - `output/knowledge-final-crucigrama/` -> estado serializado con `variant: crucigrama` y pistas reales horizontales/verticales.
  - Sin `errors-*.json` en esos runs.
- Verificacion adicional de reinicio aleatorio (no-Quiz):
  - `output/knowledge-random-check-sudoku/`, `...-domino/`, `...-paciencia/`, `...-puzle/` muestran cambio de `match.current` entre iteraciones tras tecla de reinicio.

## 2026-02-24 - Crucigrama + nuevo Pac-Man (arquitectura modular completa)
- `CrosswordKnowledgeGame.jsx` actualizado para mostrar posicion de inicio `(fila,columna)` en cada pista horizontal/vertical (indices 1-based) y exponer tambien `start` por clue en estado.
- Nuevo juego `Pac-Man Maze Protocol` integrado en catalogo/playground con categoria `Arcade`:
  - ficha nueva en `src/data/games.js` + portada `src/assets/games/pacman-maze-protocol.svg`.
  - mapeo y hints de control actualizados en `src/components/GamePlayground.jsx`.
- Implementado motor desacoplado Pac-Man:
  - `src/game/engine/`: `GameLoop`, `InputManager`, `AudioManager`, `AssetLoader`.
  - `src/game/world/`: `TileMap`, `Collision`, `NavigationGraph`, `directions`.
  - `src/game/entities/`: `Pacman`, `GhostBase`, `Blinky`, `Pinky`, `Inky`, `Clyde`.
  - `src/game/ai/`: `GhostFSM`, `Targeting`, `Pathfinding` (BFS).
  - `src/game/state/`: `GameState`, `LevelManager`.
  - runtime de orquestacion: `src/game/PacmanRuntime.js`.
  - capa UI React: `src/ui/PacmanHUD.jsx`, `PacmanMenu.jsx`, `PacmanPauseOverlay.jsx`, `PacmanEndOverlay.jsx`.
  - host del juego: `src/games/PacmanGame.jsx`.
- Reglas implementadas:
  - pellets (10), power pellets (50), frightened, comido de fantasmas con escala 200/400/800/1600,
  - vidas/reset de posiciones, paso de nivel al limpiar pellets, tuneles laterales, pausa/menu/game over/win,
  - high score en `localStorage`, metrica FPS/frame time, debug overlay con hitboxes/intersecciones/targets.
- Tests unitarios anadidos (Vitest):
  - `src/game/world/TileMap.test.js` (parsing + pellets),
  - `src/game/world/Collision.test.js` (paredes + puerta casa fantasmas),
  - `src/game/ai/GhostFSM.test.js` (timers/transiciones + scoring frightened).
- Tooling:
  - `package.json` anade scripts `test`, `test:watch` y devDependency `vitest@0.34.6` (compatible con Node 16).
  - nuevo `vitest.config.js`.
- Documentacion nueva: `docs/pacman-architecture.md` (modulos, separacion, justificacion BFS).

### Validacion ejecutada
- Build OK: `npm run build` (requiere ejecucion fuera de sandbox por `spawn EPERM` de esbuild).
- Test OK: `npm run test` -> `3` ficheros, `7` tests passing (tambien fuera de sandbox por `spawn EPERM` de esbuild/vite config).
- QA Playwright Pac-Man ejecutada con cliente de skill (`web_game_playwright_client.skill.mjs`) en:
  - `output/arcade-pacman/shot-0..2.png`
  - `output/arcade-pacman/state-0..2.json`
  - sin `errors-*.json`.
- QA adicional post-fix:
  - Crucigrama verificado con Playwright en `output/knowledge-crucigrama-rowcol/state-0.json` mostrando pistas con coordenadas de inicio (`(fila,columna)`).
  - Pac-Man verificado en `output/arcade-pacman/` y escenario extra de pausa/reanudacion en `output/arcade-pacman-pause/` (estado final `status: playing`, sin `errors-*.json`).
- Hotfix de input Pac-Man (peticion usuario):
  - `Pacman.js` ajustado para que al girar use centrado en el eje de la direccion objetivo (no en el eje de la direccion previa).
  - Se mantiene persistente la direccion en buffer (ya no se limpia tras un giro), mejorando fiabilidad de lectura de input en intersecciones.
- Revalidado:
  - `npm run test` OK (7/7).
  - `npm run build` OK.
  - Playwright focalizado en regresion de input (`output/arcade-pacman-input-regression/state-0.json`) confirma Pac-Man retomando movimiento a la derecha tras un input bloqueado previo.
## 2026-02-24 - Pac-Man: pellets inaccesibles corregidos y validados
- Ajustado `src/game/state/LevelManager.js` para eliminar 5 pellets encerrados dentro de la casa de fantasmas (sin camino valido para Pac-Man).
  - Filas modificadas del mapa base:
    - `#.###.#.#CH# # ###..#`
    - `#.....#.#   #.#.....#`
- Anadido test de regresion `src/game/state/LevelManager.test.js`:
  - Recorre por BFS los tiles transitables por Pac-Man desde spawn.
  - Valida en todos los niveles configurados (`1..maxLevel`) que no exista ningun `.`/`o` inaccesible.

### Validacion
- Test focalizado (Vitest) OK:
  - `src/game/state/LevelManager.test.js`
  - `src/game/world/TileMap.test.js`
  - `src/game/world/Collision.test.js`
  - Resultado: `3` ficheros, `5` tests passing.
- Build OK: `npm run build`.
- QA Playwright Pac-Man (skill client) OK:
  - `output/arcade-pacman-pellet-accessibility/shot-0..2.png`
  - `output/arcade-pacman-pellet-accessibility/state-0..2.json`
  - sin `errors-*.json`.
- Verificacion adicional por script: `pellets=211`, `inaccessible=0`.
- Revalidacion global adicional: npm run test OK -> 4 ficheros, 8 tests passing.
## 2026-02-24 - Ajedrez FIDE: ajuste de material insuficiente + tests de regresion
- Corregida la deteccion de `insufficient_material` en `src/games/chess/chessEngine.js` para evitar falsos positivos de tablas.
  - Ya no se declara tablas automaticamente en casos con potencial de mate (ej. alfil+caballo vs rey, caballo vs caballo).
  - Se mantienen como tablas automaticas los casos garantizados (rey vs rey, rey+pieza menor vs rey, rey+2 caballos vs rey, alfil vs alfil con casillas del mismo color).
- Ampliada la bateria en `src/games/chess/chessEngine.test.js` con 3 nuevos escenarios:
  - no tablas en alfil+caballo vs rey,
  - no tablas en caballo vs caballo,
  - tablas en dos caballos vs rey.

### Validacion
- Test focalizado: `npm run test -- src/games/chess/chessEngine.test.js` -> `10/10` OK.
- Build: `npm run build` OK.
- Nota de entorno: ambos comandos deben ejecutarse fuera de sandbox por `spawn EPERM` (esbuild) en este host Windows.
- QA Playwright skill (post-fix) ejecutada en `output/chess-audit-fix4/` usando hash directo `#game=strategy-chess-grandmaster`.
  - Capturas `shot-0..2.png` y estado `state-0..2.json` en modo `chess_fide_board`.
  - Verificado visualmente `shot-2.png` con tablero/piezas/panel de ajedrez visibles.
  - Sin `errors-*.json` en la corrida.
## 2026-02-24 - Ajedrez: piezas por figura (referencia visual dorado/negro)
- `src/games/ChessGame.jsx` actualizado para renderizar figuras reales de ajedrez por tipo/color en tablero, capturadas y promocion (`?????? / ??????`).
- Se mantiene la notacion interna SAN/FIDE; el cambio es visual y de UX.
- `src/styles.css` ajustado para acabado inspirado en referencia: dorado para blancas, negro grafito para negras, con sombras y trazo para mejor legibilidad.
- Validacion:
  - `npm run build` OK.
  - Playwright en `output/chess-piece-style/` sin `errors-*.json`, con tablero mostrando figuras en lugar de letras.
## 2026-02-24 - Domino migrado a Estrategia (partida completa + IA por niveles)
- Nuevo juego completo de domino estrategico en `src/games/DominoStrategyGame.jsx` (integrado como reemplazo del domino anterior):
  - set doble-seis (28 fichas) y reparto competitivo jugador vs IA,
  - salida automatica por doble mas alto / ficha mas alta,
  - turnos con validacion de extremos y paso por falta de jugada,
  - cierre por dominio (mano vacia) o tranca (dos pases seguidos),
  - puntuacion por rondas y victoria global por objetivo configurable (50/100/150/200).
- IA con tres dificultades:
  - `Facil`: seleccion legal simple,
  - `Media`: heuristica de pips/movilidad/control de extremos,
  - `Dificil`: minimax (profundidad corta) con evaluacion de estado.
- Reglas embebidas en el propio juego (panel `details`) incluyendo el prompt completo de reglas solicitado.
- Integracion de plataforma:
  - `src/components/GamePlayground.jsx`: el id `knowledge-domino-chain` ahora carga `DominoStrategyGame` y se actualizaron hints ES/EN.
  - `src/data/games.js`: ficha del domino movida a categoria `Estrategia` con copy tecnico y de producto acorde.
- UI/CSS:
  - `src/styles.css` ampliado con tema visual dedicado `domino-strategy-game` (config, marcador, zonas de mano, toolbar, resumen de ronda y reglas).

### Validacion
- Build: `npm run build` OK (ejecucion fuera de sandbox por EPERM de esbuild en este host).
- QA Playwright (skill client) en `output/strategy-domino-audit/`:
  - `shot-0..2.png`, `state-0..2.json`, sin `errors-*.json`.
  - Estado serializado verificado en modo `strategy-domino-classic` con cadena/manos/puntuacion/turno/IA.
- Captura visual focalizada del gameplay real:
  - `output/strategy-domino-audit/shot-gameplay.png`
  - `output/strategy-domino-audit/state-gameplay.json`.
## 2026-02-25 - Crucigrama: variacion de tamano + deduplicacion de pistas (implementacion)
- `CrosswordKnowledgeGame.jsx` refactorizado para soportar layouts validos de distinto tamano (`compact5`, `expanded6`, `extended7`).
- Banco de crucigramas ES/EN ampliado con plantillas 5x5, 6x6 y 7x7; ahora cada partida puede salir con tamano distinto de forma aleatoria.
- Validacion de plantillas anadida:
  - verifica longitud/alfabeto por layout,
  - comprueba cruces coherentes,
  - descarta plantillas con pistas repetidas o palabras repetidas dentro de la misma partida.
- Reinicio aleatorio ajustado para evitar repetir inmediatamente la misma plantilla cuando hay alternativas.
- Payload QA ampliado con `grid` (filas/columnas/casillas jugables).
- `styles.css`: `crossword-grid` ahora usa columnas dinamicas (`--crossword-cols`) en lugar de 5 fijas.
- Pendiente inmediato: build + validacion Playwright y revision de capturas/estado.
## 2026-02-25 - Crucigrama: variacion de tamano + deduplicacion de pistas (validacion)
- Build validado: `npm run build` OK (requiere ejecucion fuera de sandbox por `spawn EPERM` de esbuild en sandbox).
- QA Playwright ejecutada con `web_game_playwright_client.mjs` en modo crucigrama con URL `#game=knowledge-crucigrama-mini`.
- Muestreo de partidas aleatorias confirma presencia de 3 tamanos:
  - 5x5 (`grid.openCells = 19`) en `output/knowledge-crucigrama-dynamic-run21/state-0.json`.
  - 6x6 (`grid.openCells = 24`) en `output/knowledge-crucigrama-dynamic-run25/state-0.json`.
  - 7x7 (`grid.openCells = 34`) en `output/knowledge-crucigrama-dynamic-run22/state-0.json`.
- Capturas visuales in-game revisadas para 5x5/6x6/7x7 (`shot-0.png` en runs 21, 25 y 22 respectivamente).
- Verificacion automatica adicional sobre estados generados: sin pistas duplicadas en la misma partida (`ok-no-duplicate-clues`).
- Sin archivos `errors-*.json` generados en estas rondas.
- Validacion adicional de reinicio consecutivo (`Partida aleatoria`): 12 rondas en la misma sesion sin repetir pistas de forma consecutiva (`repeatedConsecutively: false`).
## 2026-02-25 - Ajedrez: animaciones de fin de partida (victoria/derrota/tablas)
- `src/games/ChessGame.jsx`:
  - anadido mapeo de resultado a presentacion visual (`win`, `lose`, `draw`) en funcion del `result` del motor y el color del jugador.
  - anadido overlay animado de fin de partida sobre el tablero (`.chess-end-overlay`) con copy contextual:
    - victoria del jugador,
    - derrota frente a IA,
    - tablas con motivo (ahogado, repeticion, 50/75 movimientos, material insuficiente, etc.).
  - anadidos elementos visuales de particulas deterministas para asegurar consistencia en QA automatizado.
- `src/styles.css`:
  - nuevas capas y animaciones CSS para estados de cierre:
    - `outcome-win`: glow positivo + burst de particulas,
    - `outcome-lose`: pulso/temblor de derrota + particulas rojas,
    - `outcome-draw`: anillos y transicion neutra + particulas frias.
  - `chess-board-shell` ajustado a `position: relative` y `overflow: hidden` para contener overlay.

### Validacion
- Build: `npm run build` OK (fuera de sandbox por `spawn EPERM` en este host).
- Playwright: corrida de humo en `output/chess-outcome-animations/` con `shot-0..1.png` y `state-0..1.json`.
- Sin archivos `errors-*.json` en esa corrida.
## 2026-02-25 - Rebuild crucigrama ES/EN (>10k terminos + pistas)
- Rehecho el banco de terminos/pistas para crucigrama con script reproducible `scripts/build_crossword_term_bank.mjs`.
- Fuente lexical: tesauros de LibreOffice (`dict-es/th_es_ANY_v2.dat`, `dict-en/th_en_US_v2.dat`).
- Nuevo modulo generado: `src/games/knowledge/crosswordTermBank.js`.
- Cobertura final por locale: ES=10.700 terminos, EN=12.000 terminos (longitudes 5-8).
- Reemplazado generador sintetico por `src/games/knowledge/crosswordGenerator.js` basado en term bank real y cruces validos.
- `CrosswordKnowledgeGame.jsx` actualizado para consumir pista real por termino (sin texto sintetico).
- Test actualizado en `crosswordGenerator.test.js` para validar:
  - cobertura >10k por locale,
  - generacion en 10.000 partidas por locale,
  - rejillas 5x5/6x6/7x7/8x8,
  - correspondencia exacta palabra->pista con el banco.
- Mejora UX de calidad en pistas:
  - filtro anti-autorreferencia para impedir que la pista contenga la respuesta o derivados directos,
  - fallback neutral cuando una pista potencial filtra la palabra.
- Metricas QA post-regeneracion:
  - duplicados de palabra: 0 en ES y EN,
  - pistas con automenccion de la respuesta: 0 en ES y EN.
- Validacion tecnica completada:
  - `npm run test -- src/games/knowledge/crosswordGenerator.test.js` OK,
  - `npm run build` OK,
  - Playwright + inspeccion visual en `output/knowledge-crucigrama-rebuild-v4/` (captura y estado JSON coherentes).
- Nota: build mantiene warning de chunk grande esperado por el tamano del term bank.
## 2026-02-25 - Plataforma Aventura: campaña aleatoria 5 mapas + verticales + jefes
- Rehecho el flujo de campana en `PlatformerEngine` para generar una ruta aleatoria de 5 mapas por partida.
- Regla de run implementada:
  - 4 mapas aleatorios iniciales,
  - 1 mapa de jefe final fijo siempre en la posicion 5/5,
  - inclusion garantizada de un segundo mapa de jefe antes del final,
  - inclusion garantizada de al menos un mapa vertical por run.
- Añadido soporte de metadata de nivel en loader (`layoutType`, `boss`, `isBossLevel`, `isFinalBossLevel`) y catalogo (`getLevelCatalog`).
- Integrado sistema de jefes:
  - nuevo tipo de enemigo `boss` (vida, dano progresivo, cooldown de dano, IA de carga/salto),
  - barra de vida de jefe en HUD canvas,
  - bloqueo de bandera en mapas de jefe hasta derrotarlo.
- Camara ampliada a seguimiento en X/Y para habilitar mapas verticales jugables.
- Render actualizado:
  - desplazamiento por `camera.y` para tiles/entidades/proyectiles/objetivo/efectos,
  - nuevo render de sprite de jefe estilo arcade scratch-like.
- UI actualizada en `PlatformerGame`, `GamePlayground` y `games.js` para reflejar rutas aleatorias, layouts mixtos y combates contra jefes.
- Catalogo de niveles ampliado de 7 a 12 mapas:
  - nuevos: `level-8.json`, `level-9.json` (verticales),
  - `level-10.json` (boss),
  - `level-11.json` (hybrid),
  - `level-12.json` (final boss marcado con `boss.finalBoss=true`).
- Test nuevo: `src/games/platformer/levels/levelCatalog.test.js` validando diversidad y presencia de jefes/final boss.
- Validacion ejecutada:
  - `npm run test -- src/games/platformer/levels/levelCatalog.test.js` OK,
  - `npm run build` OK,
  - Playwright + inspeccion visual/estado:
    - `output/platformer-random-boss-run-v1/` (run 5 mapas, vertical en inicio, ruta y bosses en JSON),
    - `output/platformer-random-boss-canvas-attempt-3/` (mapa de jefe con barra de vida visible en canvas).
- Evidencia de requisitos en estado runtime:
  - `campaign.route` de longitud 5,
  - `campaign.bossLevels = 2`,
  - ultimo mapa de ruta `citadel-heart-12` (final boss).
## 2026-03-01 - RaceGame2DPro: arranque + realismo de circuito + camara seguimiento
- Corregido flujo de inicio desde setup/end para evitar que `Iniciar carrera` falle cuando el canvas aun no esta montado (`initializeRace` + `pendingStartRef`).
- Rehecha la geometria de `TRACKS` (18 circuitos) con trazadas mas cercanas a circuitos reales: rectas largas, secciones tecnicas, curvas enlazadas y zonas tipo chicane/hairpin.
- Mejorado render del asfalto: runoff, bordes, pianos rojo/blanco por curvatura y linea central discontinua para lectura visual de trazada.
- Ajustada camara de seguimiento del jugador (look-ahead + zoom dinamico + shake por colision), activa durante toda la carrera.
- Limpiados textos corruptos por codificacion en UI (setup/HUD/end/touch controls) para presentacion profesional.
- CSS de `RaceGame2DPro.css` mantenido en version reescrita integral previa.
- Validacion tecnica:
  - `npm run build` OK (sin errores de compilacion; warning esperado de chunk grande global del proyecto).
  - Playwright OK sobre `#game=racing-race2dpro` con click en `.r2p__startBtn`.
  - Evidencia visual en `output/racing-start-button-fix/shot-0.png..shot-2.png` (entra en carrera y se ve pista actualizada con pianos).
- Nota: `RaceGame2DPro.jsx` queda por encima de 4000 lineas (actualmente >4500) segun requisito del encargo.
## 2026-03-01 - Crucigrama: tablero compacto + pistas a la derecha + formato tipo Ahorcado
- Ajustado `CrosswordKnowledgeGame` para que el tablero use tamano de celda reducido y adaptativo por dimension de rejilla (`5x5` a `8x8`).
- Reestructurada la UI del crucigrama a layout de dos columnas: tablero/acciones a la izquierda y pistas a la derecha.
- En responsive (`<=719px`) el layout vuelve a una sola columna para mantener legibilidad.
- Unificada la estructura de pistas del crucigrama al estilo Ahorcado:
  - ES: `N. Pista: <definicion>`
  - EN: `N. Clue: <definition>`
- Aniadido normalizador para estandarizar cada pista como frase breve con puntuacion final, aplicandose a todas las partidas/palabras generadas por el motor.
- Validacion:
  - `npm run test -- src/games/knowledge/crosswordGenerator.test.js` OK.
  - `npm run build` OK.
  - Playwright + revision visual en `output/knowledge-crucigrama-layout-hints-right/` (tablero mas pequeno y pistas a la derecha confirmados).
## 2026-03-01 - Crucigrama: reescritura integral del estilo de pistas
- Reescrito el normalizador de pistas para crucigrama desde cero en `CrosswordKnowledgeGame`:
  - se elimino el formato heredado ("palabra emparentada", "entrada lexical vinculada", etc.),
  - se implemento parser + transformacion semantica para producir pistas directas estilo Ahorcado,
  - se incorporo limpieza de mojibake y normalizacion de texto.
- Nuevo formato de salida en UI:
  - ES: `Pista: ...`
  - EN: `Clue: ...`
  - se retiro prefijo numerico en la frase para alinearlo con el estilo Ahorcado.
- Validacion:
  - `npm run build` OK,
  - `npm run test -- src/games/knowledge/crosswordGenerator.test.js` OK,
  - Playwright visual en `output/knowledge-crucigrama-clues-rewrite/` confirmando el nuevo formato en todas las pistas mostradas.
## 2026-03-01 - Crucigrama: limpieza total de pistas y formato unificado
- `src/games/knowledge/CrosswordKnowledgeGame.jsx` actualizado para rehacer todas las pistas en tiempo de juego a partir del banco actual con un normalizador nuevo:
  - elimina el estilo heredado ("termino asociado", "entrada lexical vinculada", etc.),
  - extrae ancla semantica y tipo gramatical,
  - reescribe cada pista en formato definicional corto.
- Formato final aplicado en UI para todas las palabras: `Pista: ...` (ES) y `Clue: ...` (EN), sin prefijo numerico en la frase.
- Panel de pistas simplificado a una lista unica (`Pistas/Clues`) en lugar de separar por "Horizontales/Verticales".
- Validacion tecnica:
  - `npm run build` OK (fuera de sandbox por `spawn EPERM`),
  - `npm run test -- src/games/knowledge/crosswordGenerator.test.js` OK (fuera de sandbox por `spawn EPERM`),
  - Playwright QA en `output/knowledge-crucigrama-clues-clean-v2/` con `shot-0..2.png` y `state-0..2.json`, sin `errors-*.json`.
- Verificacion visual: captura revisada (`shot-0.png`) confirma nuevo bloque `Pistas` con todas las lineas en formato `Pista: ...`.
- Ajuste final del normalizador: inferencia de tipo semantico mas conservadora para evitar pistas de cualidad en conceptos nominales (prioriza `noun` salvo senales claras de verbo/adverbio o POS explicito).
- Revalidado tras el ajuste:
  - `npm run build` OK,
  - `npm run test -- src/games/knowledge/crosswordGenerator.test.js` OK,
  - Playwright rehecha en `output/knowledge-crucigrama-clues-clean-v2/`.
## 2026-03-01 - Crucigrama (coordenadas en pistas) + altura extra de juego (Sky Runner/Crucigrama)
- `src/games/knowledge/CrosswordKnowledgeGame.jsx`:
  - Las pistas ahora muestran posicion de inicio de palabra con coordenadas 1-based:
    - ES: `Pista (fila X, columna Y): ...`
    - EN: `Clue (row X, column Y): ...`
  - Se usa el `start` real de cada entrada del generador para evitar desalineaciones.
- `src/styles.css`:
  - Modal launch para Sky Runner: `max-height` del canvas host aumentado de `44vh` a `48vh` en `.launch-game-area .platformer-game .phaser-canvas-host`.
  - Modal launch para Crucigrama: `max-height` del panel de pistas aumentado a `430px` en `.launch-game-area .knowledge-arcade-game.knowledge-crucigrama .crossword-clues`.

### Validacion
- Build: `npm run build` OK (fuera de sandbox por `spawn EPERM` en sandbox).
- Playwright skill client (fuera de sandbox por `spawn EPERM` de Chromium en sandbox):
  - Crucigrama: `output/knowledge-crucigrama-rowcol-height-20260301/` (`shot-0..2.png`, `state-0..2.json`).
    - Confirmado en estado: pistas con formato `Pista (fila X, columna Y): ...`.
  - Sky Runner: `output/platformer-height-20260301/` (`shot-0..2.png`, `state-0..2.json`).
  - Sin `errors-*.json` en ambos outputs.

## 2026-03-01 - Pong: porterias centrales (extremos sin punto)
- `src/games/pong/constants.js`:
  - anadidos `goalOpeningRatio` y `goalOpeningMinHeight` para parametrizar la zona valida de gol.
- `src/games/pong/PongRuntime.js`:
  - calculada `goalArea` central de forma determinista desde el alto del canvas.
  - la puntuacion ahora solo se registra si la bola cruza la pared lateral dentro de la porteria.
  - cuando la bola cruza por los extremos (fuera de porteria), rebota en pared lateral y no suma punto.
  - anadido render visual de segmentos de pared superior/inferior y marcas de limite de porteria.
- `src/games/PongGame.jsx`:
  - snapshot por defecto extendido con `goalTop`/`goalBottom` para trazabilidad QA.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild dentro del sandbox).
- Playwright skill client OK:
  - `output/pong-goal-porteria-check/shot-0.png..shot-2.png`.
  - sin `errors-*.json` en la corrida.

## 2026-03-01 - Pong: velocidad maxima de pelota por dificultad IA
- `src/games/pong/constants.js`:
  - cada preset de dificultad ahora define su `maxBallSpeed`:
    - `rookie`: `880`
    - `arcade`: `1060`
    - `pro`: `1280`
- `src/games/pong/PongRuntime.js`:
  - anadido `getBallMaxSpeed()` para resolver el tope dinamico segun `difficultyKey`.
  - toda la fisica que limitaba velocidad con `BALL_CONFIG.maxSpeed` ahora usa el tope dinamico:
    - saque,
    - rebotes en palas,
    - rebotes en pared superior/inferior,
    - rebote lateral fuera de porteria,
    - limite superior de `aiSpeedCap` adaptativo.
  - al cambiar dificultad (`setDifficulty`) se actualiza `state.ballMaxSpeed` y se clampa la velocidad actual de la bola para evitar quedar por encima del nuevo maximo.
  - snapshot extendido con `ballMaxSpeed`.
- `src/games/PongGame.jsx`:
  - snapshot por defecto extendido con `ballMaxSpeed` para coherencia inicial.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild dentro del sandbox).
- Playwright skill client OK:
  - `output/pong-difficulty-speed-check/shot-0.png..shot-2.png`
  - sin `errors-*.json`.

## 2026-03-01 - Domino (revision de reglas Ludoteka + mejora UX/UI)
- `src/games/DominoStrategyGame.jsx`:
  - reglas internas actualizadas para reflejar modalidad activa `Domino 7+7` contra IA.
  - cierre por tranca corregido en puntuacion:
    - antes: sumaba solo la mano rival,
    - ahora: suma total bloqueado (mano jugador + mano IA), como en la regla de tranca.
  - salida por rondas ajustada:
    - ronda 1 abre por doble mas alto / ficha mas alta,
    - rondas siguientes alternan salida (`nextStarter`).
  - payload QA ampliado con `variant: domino-7-plus-7` y `nextStarter`.
  - mejoras de jugabilidad:
    - fichas jugables resaltadas en la mano,
    - indicador `L`, `R` o `L/R` por ficha segun extremos posibles,
    - dobles marcados como `is-double` para render perpendicular en mesa/mano.
  - resumen de ronda ampliado en tranca con puntos de mano `Tu/IA`.
- `src/styles.css`:
  - nueva capa visual de mesa para domino estrategico (`domino-table`, chip de modalidad, nota de reglas activas).
  - cadena de mesa en layout mas legible (flex, centrada, area minima).
  - estilo de dobles perpendiculares para `domino-strategy-game`.
  - mejora de feedback visual en fichas jugables/no jugables y badge de legalidad.
  - ajuste responsive para cabecera de mesa en movil.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild dentro del sandbox).
- Playwright skill client OK:
  - `output/strategy-domino-rules-ux-check/shot-0.png..shot-2.png`
  - `state-0..2.json` con `variant: domino-7-plus-7` y `nextStarter`.
  - sin `errors-*.json`.
## 2026-03-01 - Estrategia: Texas Hold'em sin apuestas (1 IA / 3 IA)
- Nuevo juego implementado: `strategy-poker-holdem-no-bet` con motor propio en `src/games/PokerTexasHoldemGame.jsx`.
- Reglas aplicadas:
  - flujo Hold'em por fases (`preflop`, `flop`, `turn`, `river`, showdown),
  - dealer rotativo por mano,
  - evaluador real de manos de poker (carta alta -> escalera de color),
  - sin apuestas bajo ningun concepto (sin bote, sin fichas, sin ciegas economicas).
- Mecanicas de decision:
  - acciones `pasar`, `retirarse` y `cambio tactico` (1 vez por mano),
  - IA configurable por perfil y partida configurable contra `1 IA` o `3 IA`.
- UX/UI:
  - nueva mesa visual de poker con fases destacadas, score por victorias de mano, chips de turno/dealer, estados de cartas ocultas/reveladas y panel de reglas.
  - estilos nuevos en `src/styles.css` para bloque `poker-holdem-game`.
- Integracion de catalogo/plataforma:
  - nueva portada `src/assets/games/strategy-poker-no-bet.svg`.
  - metadata bilingue en `src/data/games.js` dentro de categoria `Estrategia`.
  - registro de componente + hints en `src/components/GamePlayground.jsx` y `src/games/registry.jsx`.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild dentro de sandbox).
- Playwright skill client:
  - URL: `#game=strategy-poker-holdem-no-bet`
  - output: `output/strategy-poker-audit/shot-0..2.png` y `state-0..2.json`
  - sin archivos `errors-*.json`.
- Verificacion adicional modo `3 IA`:
  - script Playwright cambiando selector `#poker-opponents` a `3` y aplicando configuracion.
  - evidencia en estado serializado (`opponents: 3` con 4 asientos) y captura `output/strategy-poker-audit/shot-3ai.png`.
## 2026-03-01 - Poker: rediseño visual estilo mesa de casino (referencia Full Tilt)
- Rediseñado el layout de `PokerTexasHoldemGame` para representar una mesa oval de poker con asientos alrededor:
  - IA en posiciones superiores (izq/centro/der cuando hay 3 IA),
  - jugador en posicion inferior central,
  - board comunitario centrado dentro del fieltro.
- `src/games/PokerTexasHoldemGame.jsx`:
  - anadido helper `aiSeatPositionClass(...)` para distribuir asientos IA en geometria de mesa.
  - migrado bloque JSX de mesa a estructura `poker-round-table` con `poker-table-seat` posicionales.
- `src/styles.css`:
  - nuevo look inspirado en referencia adjunta (fondo burdeos, rail madera, fieltro verde, placas azul oscuro, botones azules).
  - correccion de posicion de dealer/asientos: `poker-seat` ahora mantiene posicion relativa sin romper asientos absolutos.
  - ajuste de escala para evitar recorte en modal: mesa compactada (`height: clamp(360px, 46vh, 460px)`) y asientos/cartas redimensionados.
  - fallback responsive movil mantiene legibilidad en columna.

### Validacion visual
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild en sandbox).
- Playwright QA estilo mesa:
  - `output/strategy-poker-style-roundtable-v3/shot-0.png` (1 IA, distribucion correcta jugador abajo / IA arriba).
  - `output/strategy-poker-style-roundtable-v3/shot-3ai.png` (3 IA distribuidas alrededor de la mesa + jugador abajo).
- Estado serializado en modo 3 IA confirmado con `opponents: 3` en payload `render_game_to_text`.

## 2026-03-01 - Poker: reglas clasicas 5 cartas + opcion 5 IAs + nuevo contexto IA
- `src/games/PokerTexasHoldemGame.jsx` rehecho para pasar de Hold'em a poker clasico de 5 cartas (sin apuestas), alineado con el prompt base compartido:
  - fases nuevas: `Antes del descarte` -> `Descarte` -> `Despues del descarte` -> showdown;
  - descarte real de `0..5` cartas (una vez por mano);
  - lectura/evaluacion de mano clasica (carta mayor a escalera de color);
  - dealer rotativo por mano y cierre por victoria de objetivo.
- Configuracion de rivales ampliada de `1/3` a `1/3/5` IAs:
  - selector `#poker-opponents` ahora incluye `5`;
  - payload QA confirma `opponents: 5` y `6` asientos activos.
- Bases IA actualizadas al nuevo contexto:
  - nuevo `RULES_PROMPT` con reglas de poker clasico basado en el prompt entregado;
  - decisiones IA adaptadas por fase (pre-descarte, descarte, post-descarte);
  - logica de descarte tactico y estimacion de win-rate por simulacion.
- UX/controles actualizados:
  - acciones de descarte del jugador (`1-5` seleccionar, `D` descartar, `S` servirse);
  - textos de ayuda actualizados en `src/components/GamePlayground.jsx` y `src/games/registry.jsx`;
  - metadata del catalogo actualizada en `src/data/games.js` (descripcion/objetivo/highlights/multiplayer para 1-3-5 IAs).
- CSS de mesa actualizada en `src/styles.css`:
  - nuevas posiciones `seat-pos-mid-left` y `seat-pos-mid-right` para soportar 5 IAs;
  - ajuste de tamano de asientos/cartas y responsive;
  - anadida lista central de estado de descarte por jugador (`.poker-discard-status`).

### Validacion
- Build: `npm run build` OK (ejecutado fuera de sandbox por `spawn EPERM` de esbuild dentro de sandbox).
- Playwright skill client (web_game_playwright_client.mjs):
  - URL `#game=strategy-poker-holdem-no-bet`
  - output `output/strategy-poker-classic-rules/shot-0..2.png` + `state-0..2.json`
  - sin `errors-*.json`.
- Verificacion especifica 5 IAs (Playwright adicional):
  - aplicando selector `#poker-opponents = 5` + `Aplicar y reiniciar`;
  - evidencia en `output/strategy-poker-classic-rules/shot-5ai.png`;
  - estado `output/strategy-poker-classic-rules/state-5ai.json` con `opponents: 5` y asientos `IA 1..IA 5`.

## 2026-03-01 - Poker: fix de distribucion de asientos/mazos en mesa redonda
- Corregida la distribucion visual de jugadores en `src/games/PokerTexasHoldemGame.jsx`:
  - eliminada rejilla fija de clases `seat-pos-*`;
  - nuevo calculo dinamico por arco ovalado para asientos IA (`seatPosition`) en funcion del total de jugadores;
  - jugador humano fijado en posicion inferior central para legibilidad.
- Ajustes de estilo en `src/styles.css`:
  - `poker-table-seat` ahora usa coordenadas CSS variables (`--seat-x`, `--seat-y`) para posicionado real en mesa;
  - ancho diferenciado por tipo de asiento (`poker-player-seat` mas ancho, `poker-ai-seat` compacto);
  - mazos ocultos IA compactados en abanico horizontal (`.hidden-hand`) para evitar solapes entre asientos;
  - `poker-board-zone` compactado para dejar margen a los asientos.
- Responsive actualizado:
  - en <=860px se reajustan anchos de asientos;
  - en <=560px se mantiene stack vertical existente sin posicionamiento absoluto.

### Validacion visual
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` en sandbox).
- Playwright QA:
  - `output/strategy-poker-layout-fix/shot-0.png` (mesa 1 IA sin solapes de mazos),
  - `output/strategy-poker-layout-fix/shot-5ai-layout.png` (mesa 5 IAs repartidas en arco sin recortes laterales).
- Estado serializado 5 IAs confirmado:
  - `output/strategy-poker-layout-fix/state-5ai-layout.json` con `opponents: 5` y 6 asientos activos.

## 2026-03-01 - Auditoria de cumplimiento (prompt Fournier poker clasico)
- Revisado `src/games/PokerTexasHoldemGame.jsx` frente al prompt Fournier completo compartido por usuario.
- Validacion runtime realizada:
  - Playwright: `output/strategy-poker-review/shot-0..2.png` + `state-0..2.json` (sin `errors-*.json`).
  - Build: `npm run build` OK (fuera de sandbox por `spawn EPERM` dentro de sandbox).
  - Tests: `npm test` OK (10 files, 29 tests, fuera de sandbox por `spawn EPERM` dentro de sandbox).
- Resultado de cumplimiento:
  - El juego funciona como variante "draw 5 cartas sin apuestas", pero **no cumple el prompt Fournier completo**.
  - Faltan reglas clave del prompt: envites/apuestas (fichar/envidar/reenvidar), Pot/Jack Pot, ley de apertura (pareja de jotas), gestion de bote/reparto, y fases completas de envite clasico.
  - No se implementa comodin ni `repoker`; ranking actual llega hasta escalera de color.
  - Configuracion de jugadores limitada a 1/3/5 IAs (2/4/6 total), no rango completo configurable 2..7.
  - En empates se suman victorias a todos los empatados (score por manos), en lugar de mecanica de bote repartido del prompt.
- Recomendacion siguiente agente:
  - Si se exige cumplimiento total del prompt, migrar de "no-bet draw poker" a motor de envites clasico con estado de pote y reglas de apertura.

## 2026-03-01 - Poker: ajuste de mesa redonda + watchdog anti-bloqueo IA
- `src/games/PokerTexasHoldemGame.jsx`:
  - reajustada geometria de asientos (`seatPosition`) para desplazar IAs al arco superior y bajar al jugador humano;
  - anadido visor central `Cartas de ronda` (slots en mano activa y cartas del ganador al cerrar mano) para mantener referencia visual en el centro;
  - anadido watchdog de turno IA (`setTimeout` 2600ms) que fuerza accion IA si por cualquier causa no dispara el timer principal, evitando bloqueos en descarte/turno.
- `src/styles.css` (bloque poker):
  - reducida huella del mazo del jugador (cartas mas pequenas y abanico mas compacto);
  - compactadas manos IA ocultas y mostradas para evitar invadir el centro;
  - ampliada zona central (`poker-board-zone`) y ajustado oval de fieltro/asientos para reservar espacio visible a cartas de ronda;
  - responsive reajustado para desktop/tablet sin perder legibilidad.

### Validacion
- Playwright baseline (flujo largo): `output/strategy-poker-layout-watchdog/shot-0..5.png` + `state-0..5.json`, sin `errors-*.json`.
- Playwright v2 (post-fix de solape en showdown): `output/strategy-poker-layout-watchdog-v2/shot-0..5.png` + `state-0..5.json`, sin `errors-*.json`.
- Verificacion especifica 5 IAs:
  - captura `output/strategy-poker-layout-watchdog-v2/shot-5ai-watchdog.png`;
  - timeline `output/strategy-poker-layout-watchdog-v2/state-5ai-watchdog.json` con avance de turnos IA `1 -> 2 -> 3 -> 4 -> 5 -> 0` sin bloqueo.
- Build OK: `npm run build` (fuera de sandbox por restriccion EPERM en sandbox).
## 2026-03-01 - Poker: cumplimiento de prompt sin apuestas (reglas + IA + contexto)
- `src/games/PokerTexasHoldemGame.jsx` ajustado para alinearse con el prompt de poker clasico sin economia:
  - ranking de manos ampliado con `Escalera real` explicita por encima de `Escalera de color`;
  - `RULES_PROMPT` rehecho con reglas claras de 5 cartas, showdown y prohibicion explicita de bote/fichas/ciegas/all-in/apuestas;
  - rivales IA ampliados de `1/3/5` a `1..8` (mesa total de `2..9` jugadores);
  - acciones de mesa sin retirada por apuesta: en rondas de decision solo `pasar`; descarte unico `0..5` cartas y resolucion por showdown.
- IA actualizada para mantener flujo de no-apuesta:
  - eliminadas ramas de `fold`/farol en decision IA;
  - la IA prioriza evaluacion de mano + descarte tactico y llega a showdown.
- UI y contenido sincronizados con reglas nuevas:
  - ayudas de control actualizadas en `src/components/GamePlayground.jsx` y `src/games/registry.jsx` (sin tecla de retirarse);
  - metadata de producto en `src/data/games.js` actualizada (2..9 jugadores, escalera real, objetivo por manos);
  - portada `src/assets/games/strategy-poker-no-bet.svg` actualizada para eliminar referencia a Texas Hold'em y reflejar 1..8 IA.

### Validacion
- Build: `npm run build` OK (fuera de sandbox por `spawn EPERM` en sandbox).
- Playwright skill client (`web_game_playwright_client.mjs`):
  - corrida en `#game=strategy-poker-holdem-no-bet` con `playwright-actions-strategy-poker-classic.json`;
  - evidencias en `output/web-game/shot-0..3.png` y `output/web-game/state-0..3.json`;
  - sin `errors-*.json`.
- Verificacion extra 8 IA:
  - captura `output/strategy-poker-prompt-rules/shot-8ai.png`;
  - estado `output/strategy-poker-prompt-rules/state-8ai.json` con `opponents: 8` y `seats` de `IA 1..IA 8`.
- Playwright final adicional guardado en carpeta dedicada del cambio:
  - `output/strategy-poker-prompt-rules/shot-0..2.png` + `state-0..2.json`.
  - sin `errors-*.json` en esa carpeta.
## 2026-03-01 - Poker: nuevo paradigma con fichas sin apuestas
- `src/games/PokerTexasHoldemGame.jsx` actualizado para usar fichas como progreso de partida (sin economia de apuesta):
  - objetivo de partida migrado de `victorias` a `meta de fichas` (`15/25/35`), configurable en UI;
  - cada jugador ahora mantiene `chips` y `handsWon`;
  - reparto de fichas por jugada en showdown:
    - carta mayor +1, pareja +2, dobles +3, trio +4, escalera +5, color +6, full +7, poker +8, escalera color +10, escalera real +12;
  - empate de showdown: cada ganador recibe la recompensa completa;
  - contexto IA (`RULES_PROMPT`) reescrito para dejar explicito que hay fichas de progreso pero nunca apuestas/bote/ciegas/all-in.
- Integracion UI/estado:
  - marcador superior muestra fichas y manos ganadas por jugador;
  - estado serializado (`render_game_to_text`) expone `targetChips`, `scores[].chips`, `scores[].handsWon` y `score` alineado a fichas.
- Copy actualizado para reflejar "fichas sin apuestas":
  - `src/data/games.js`,
  - `src/components/GamePlayground.jsx`,
  - `src/games/registry.jsx`.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` dentro de sandbox).
- Playwright skill client OK en `#game=strategy-poker-holdem-no-bet`:
  - output: `output/strategy-poker-chips-no-bet/shot-0..3.png` + `state-0..3.json`.
  - sin `errors-*.json`.
  - comprobado en estado: incremento real de `chips` por jugada ganadora y `targetChips` activo.
## 2026-03-01 - Poker: selector de ritmo de fichas (Rapido/Equilibrado/Maraton)
- `src/games/PokerTexasHoldemGame.jsx` ampliado con presets de ritmo de fichas:
  - `rapid` (metas 10/15/20 + recompensas mas altas),
  - `balanced` (metas 15/25/35),
  - `marathon` (metas 25/40/60 + recompensas mas contenidas).
- Nuevo selector UI `Ritmo de fichas` en configuracion de mesa; la `Meta de fichas` ahora depende del ritmo activo.
- Estado de partida extiende:
  - `chipPaceId`,
  - `chipRewards` (tabla activa por jugada),
  - payload QA con `chipPace` y `chipRewards`.
- Marcador/hud actualizado:
  - etiqueta de ritmo activa en status row,
  - tabla de recompensas visible en mesa (`Tabla activa (...)`).
- Contexto IA/reglas actualizado para indicar que la tabla exacta depende del ritmo seleccionado, manteniendo prohibicion total de apuestas.
- Copy sincronizado con nuevo control en:
  - `src/data/games.js`,
  - `src/components/GamePlayground.jsx`,
  - `src/games/registry.jsx`.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` dentro del sandbox).
- Playwright escenario de ritmos:
  - output `output/strategy-poker-chip-pace-check/` con `shot-balanced-default.png`, `shot-rapid.png`, `shot-marathon.png` y `state-*.json`.
  - verificado en estados:
    - `balanced`: `targetChips=25`, `chipRewards=[1,2,3,4,5,6,7,8,10,12]`.
    - `rapid`: `targetChips=15`, `chipRewards=[1,3,4,6,8,10,12,15,20,25]`.
    - `marathon`: `targetChips=40`, `chipRewards=[1,1,2,3,4,5,6,7,9,11]`.
  - sin `errors-*.json`.
## 2026-03-01 - Poker: habilitadas apuestas con fichas (ciegas + bote real)
- `src/games/PokerTexasHoldemGame.jsx` rehecho para cambiar de enfoque sin apuestas a enfoque con economia real de mano:
  - ciega pequena/grande por mano,
  - bote (`pot`) y apuesta actual (`currentBet`),
  - acciones de apuesta: pasar, igualar, subir, all-in y retirarse,
  - descarte unico (0..5 cartas) entre dos rondas de apuesta,
  - cierre por showdown o por retirada general,
  - reparto de bote en empate y control de stacks por jugador.
- IA adaptada a nuevo flujo de apuestas (decision pre/post descarte + descarte tactico).
- Payload de `render_game_to_text` actualizado al nuevo modo:
  - `mode: strategy-poker-clasico-bet`,
  - `variant: draw_poker_five_card_with_betting`,
  - datos de `pot`, `currentBet`, `smallBlind`, `bigBlind`, `toCall`, stacks y commits por asiento.
- CSS poker actualizado en `src/styles.css` para reflejar el nuevo enfoque:
  - nuevo panel central de bote (`.poker-pot-panel`),
  - metadata de stack/commit por asiento (`.seat-chip-row`),
  - nota de apuesta (`.poker-bet-note`),
  - grid de acciones flexible para 3-5 botones.
- Copy sincronizado con apuestas reales en:
  - `src/data/games.js` (tagline/descripcion/highlights/how-to-play ES/EN),
  - `src/games/registry.jsx` (hints ES/EN),
  - `src/components/GamePlayground.jsx` (hints ES/EN).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild en sandbox).
- Playwright QA ejecutada con `web_game_playwright_client.mjs` del repo (la version del skill en `...\scripts\web_game_playwright_client.js` falla por contexto ESM/CJS).
- Evidencias nuevas en `output/web-game/`:
  - `shot-0.png..shot-3.png`
  - `state-0.json..state-3.json`
- Verificado en estado serializado:
  - modo/variante nuevos de apuestas,
  - `pot`, `currentBet`, `toCall`, `smallBlind/bigBlind`,
  - cambios reales en `chips/currentBet/totalCommitted`.
- Sin archivos `errors-*.json` en la corrida.

### TODO sugerido
- Ejecutar una pasada Playwright adicional de layout con `3` y `5` IAs para validar distribucion visual multi-asiento en el nuevo flujo de apuestas.
## 2026-03-01 - Poker apuestas: QA layout multi-asiento (3 IA / 5 IA)
- Ejecutada validacion adicional enfocada a distribucion visual de asientos con el nuevo modo de apuestas.
- Escenarios verificados:
  - `3` IAs (`4` asientos totales),
  - `5` IAs (`6` asientos totales).
- Evidencias generadas en `output/strategy-poker-betting-layout-check/`:
  - `shot-3ai.png`, `state-3ai.json`
  - `shot-5ai.png`, `state-5ai.json`
- Confirmado en estado serializado:
  - `opponents: 3` y `opponents: 5` respectivamente,
  - modo `strategy-poker-clasico-bet` con `pot/currentBet/blinds` presentes,
  - controles de accion disponibles (`fold/call/raise/all-in`).
- Sin errores de consola/pageerror en esta pasada (no se genero `errors.json`).
## 2026-03-01 - Poker apuestas: stacks laterales + flujo central de fichas sin solapes
- `src/games/PokerTexasHoldemGame.jsx`:
  - anadido rail lateral de stack por asiento junto a las cartas (`seat-hand-shell`, `seat-stack-rail`, `seat-stack-visual`).
  - anadido flujo central de contribuciones por jugador en mesa (`poker-center-chip-flow`) mostrando nombre + cantidad aportada en ronda.
  - reestructurado el layout de mesa para evitar solapes del centro:
    - nueva geometria de asientos IA en arco superior (`seatPosition`) y jugador humano mas abajo,
    - movido bloque informativo de descartes/notas de apuesta fuera de `poker-board-zone` a `poker-table-meta`.
- `src/styles.css`:
  - nuevas capas visuales para stacks laterales y mini-pilas de fichas en el centro.
  - ajuste de escala/posicion de asientos y tablero central para liberar zona de juego.
  - compactacion de cartas ocultas IA y reajuste responsive en breakpoints `860px` y `560px`.
  - `poker-table-meta` separado para estado de descartes y notas, evitando invadir el tablero central.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild dentro del sandbox).
- Playwright (cliente del juego + escenarios dirigidos 3/5 IA):
  - carpeta: `output/strategy-poker-chipflow-layout-check/`
  - capturas generales: `shot-0..2.png`, `shot-3ai.png`, `shot-5ai.png`
  - capturas de tablero central: `shot-board-3ai-desktop.png`, `shot-board-5ai-desktop.png`, `shot-board-3ai-mobile.png`, `shot-board-5ai-mobile.png`
  - capturas responsive viewport: `shot-3ai-mobile-viewport.png`, `shot-5ai-mobile-viewport.png`
  - estados: `state-0..2.json`, `state-3ai.json`, `state-5ai.json`
  - sin errores de consola/pageerror (`errors-layout.json` no generado).
## 2026-03-01 - Poker: i18n ES/EN por locale de navegador
- `src/games/PokerTexasHoldemGame.jsx` internacionalizado para modo dual:
  - deteccion de idioma por `navigator.language` (`es*` => espanol, resto => ingles),
  - textos estaticos del componente migrados a `UI_COPY` (cabecera, configuracion, status, botones, paneles, ayudas, showdown, reglas),
  - etiquetas de fases por locale (`PHASE_LABELS`) y reglas de mesa por locale (`RULES_PROMPT` ES/EN),
  - perfiles IA localizados por locale (`AI_LEVEL_LABELS`),
  - acciones visibles localizadas (`ACTION_LABELS`),
  - nombres de jugador localizados en render (`Tu/IA n` -> `You/AI n` en ingles),
  - traduccion de mensajes dinamicos/logs/overlay/estado via `localizeRuntimeText(...)` para mantener coherencia de idioma,
  - marca de carta oculta adaptada (`IA`/`AI`) mediante prop `hiddenMark` en `PokerCard`.
- `render_game_to_text` actualizado para exponer nombres y `rulesPrompt` en el idioma activo.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `spawn EPERM` de esbuild dentro de sandbox).
- Verificacion visual i18n forzando locale `en-US`:
  - `output/strategy-poker-i18n-check/shot-en-us.png`
  - UI del componente en ingles (controles, estado de mesa, acciones, panel central y textos de asiento).
