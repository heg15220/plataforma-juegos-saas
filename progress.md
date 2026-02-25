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
