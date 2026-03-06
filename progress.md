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

## 2026-03-02 - Parchis (calidad tablero + flujo de jugada + IA)
- `src/games/ParchisStrategyGame.jsx`:
  - Mejorado flujo de jugada del usuario: clic en ficha ahora prioriza seleccion (clic 1) y confirma movimiento con segundo clic/Enter.
  - Enter/Espacio en `await-action` ejecuta la jugada de la ficha seleccionada cuando existe; si no, usa la primera jugada disponible.
  - Reordenada la lista de jugadas para priorizar la ficha seleccionada y anadido bloque de ayuda de seleccion.
  - Reducido autop-move a casos de una sola jugada sin seleccion activa.
  - IA: anadida `estimatePieceExposure` y nuevo peso `exposureWeight` por dificultad para penalizar movimientos expuestos a captura inmediata.
  - Tablero SVG refinado: margen interno real (evita clipping de bordes), marco ornamental, marcas visuales de seguros/salidas y centro de meta mejor definido.
- `src/styles.css`:
  - Mejora de acabados visuales del tablero/paneles (contrastes, sombras, bordes, legibilidad).
  - Nuevos estilos para anillos de salida, marcas de casilla segura, nota de seleccion y accion enfocada.
  - Ajustada animacion de fichas seleccionables (`piece-glow`) para no sobrescribir `transform` de posicion.

### Validacion ejecutada
- Build: `npm run build` OK.
- Playwright parchis (flujo general): `output/parchis-audit/after/shot-0..5.png` + `state-0..5.json`.
- Playwright parchis (estado seleccion): `output/parchis-audit/after-probe-2/shot-0.png` + `state-0.json`.
- En las corridas no se observaron errores nuevos de consola y `render_game_to_text` mantiene coherencia con el estado visual.

### TODO sugerido
- Si se quiere mayor control competitivo: exponer un toggle UX para activar/desactivar auto-movimiento cuando solo exista una jugada legal.
- Ajustar pesos `exposureWeight` tras partidas largas (especialmente en dificultad dificil) para equilibrar agresividad vs. seguridad.
- Verificacion dirigida de seleccion (Playwright con clic sobre SVG):
  - 1er clic en ficha seleccionable: no mueve (`firstClickMoved: false`, sigue `phase: await-action`).
  - 2o clic en la misma ficha: confirma movimiento (`secondClickMoved: true`, avance de progreso y cambio de turno).
## 2026-03-02 - Parchis: rebuild visual del tablero hacia estilo clasico (referencia Fournier/Cayro)
- Tablero rehacido desde cero con arquitectura desacoplada y modelo declarativo:
  - Nuevo modelo: `src/games/parchis/boardModel.js` (coordenadas normalizadas `0..1000`, grid logico, `track-0..67`, `home-{color}-0..7`, casas y meta central).
  - Nuevo renderer: `src/games/parchis/LudoBoard.jsx` por capas SVG (`BoardBase`, `SquaresLayer`, `OverlayLayer`, `TokensLayer`) con API de props:
    - `positions`
    - `highlightedSquares`
    - `onSquareClick(squareId)`
    - `onTokenClick(tokenId)`
    - `theme`
- Integrado en `src/games/ParchisStrategyGame.jsx`:
  - Eliminado el render anterior del tablero embebido en el componente.
  - Mapeo de estado del juego -> `positions` (fichas en track, pasillo final, casa y meta).
  - Mapeo de acciones legales -> `highlightedSquares`.
  - Click de casilla implementado para resolver jugada por destino y priorizar ficha seleccionada.
  - Mantenido flujo existente de click en ficha (clic 1 selecciona, clic 2 confirma).
- Estilo actualizado en `src/styles.css` para aproximar tablero clasico:
  - marco doble, fondo neutro, casas con circulos de color,
  - casillas numeradas, pasillos finales en color solido,
  - meta central en rombo 4 colores,
  - iconografia de seguros y marcadores de salida,
  - tokens con stacking y foco visual.

### Validacion
- Build OK: `npm run build` (ejecutado fuera de sandbox por restriccion EPERM).
- Playwright skill client sobre URL preview:
  - `output/strategy-parchis-classic-check/shot-0..3.png`
  - `output/strategy-parchis-classic-check/state-0..3.json`
  - sin archivos `errors-*.json` en la corrida limpia.

### TODO sugerido
- Ajustar aun mas la tipografia/rotacion de indices de casilla para emular 1:1 el tablero de referencia.
- Ejecutar una pasada Playwright dirigida con interaccion por selector SVG (clic en casillas resaltadas) para cubrir explicitamente `onSquareClick`.
## 2026-03-02 - Parchis: correccion de posicion de pasillos finales
- Ajustado el modelo de geometria en `src/games/parchis/boardModel.js` para centrar correctamente las filas/columnas de llegada a meta:
  - red: `[7,1] -> [7,8]`
  - blue: `[13,7] -> [6,7]`
  - yellow: `[7,13] -> [7,6]`
  - green: `[1,7] -> [8,7]`
- Resultado: los pasillos de cada color ahora quedan sobre el eje central del tablero, alineados con el estilo clasico de referencia.
- Validacion:
  - Build OK (`npm run build`, fuera de sandbox por EPERM en sandbox).
  - Captura de comprobacion: `output/strategy-parchis-home-lanes-fix/shot-0.png`.
## 2026-03-02 - Parchis: ampliacion de casillas + salidas coloreadas
- Ajustado `src/games/parchis/boardModel.js`:
  - ampliado tamano de casillas del recorrido y pasillos finales (`trackSize`, `laneSize`) para dar mas ancho util visual por casilla;
  - mantenido el trazado sin solape con casas/pasillos;
  - las casillas de salida (`start`) ahora conservan `color` en el modelo para poder pintarse por zona.
- Ajustado `src/games/parchis/LudoBoard.jsx`:
  - anadido anillo exterior de contraste en las fichas (`ludo-token-outline`) para legibilidad sobre casillas de salida coloreadas.
- Ajustado `src/styles.css`:
  - reglas de color por casilla de salida (`.ludo-square--track.is-start.color-*`),
  - contraste de numeracion/iconos en salida,
  - mejora de contraste visual de fichas (outline + ring + stroke).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM en sandbox).
- Captura de verificacion: `output/strategy-parchis-start-cell-color-fix/shot-0.png`.
## 2026-03-02 - Parchis: botones iniciar/reiniciar + salida desde casa + ajuste pasillos
- `src/games/ParchisStrategyGame.jsx`:
  - migrado el flujo de arranque a `await-start` con boton `Iniciar partida` y `Reiniciar partida` en cabecera (arriba derecha);
  - al iniciar/reiniciar, las 4 fichas de cada color arrancan en casa (`INITIAL_TRACK_PIECES = 0`);
  - salida obligatoria actualizada para activarse con 5 en cualquiera de los dos dados mostrados (`dice`/`diceAux`), manteniendo movimiento por dado principal;
  - estado/payload extendidos con `diceAux` y estado visual actualizado (`Pendiente de inicio`, dados en status row, panel de inicio en acciones);
  - IA/turnos 4 jugadores mantenidos (humano + 3 IAs) con textos/UI sincronizados.
- `src/games/parchis/boardModel.js`:
  - reajustados pasillos finales de `yellow` y `green` para evitar solape visual con los finales de `red` y `blue` en la zona central;
  - mapeo de color por owner ampliado para `ai-blue`, `ai-yellow`, `ai-green`.
- Copy/hints sincronizados con nuevo flujo de inicio:
  - `src/components/GamePlayground.jsx`
  - `src/games/registry.jsx`
  - `src/data/games.js`

### Validacion
- Build OK: `npm run build` (ejecutado fuera de sandbox por EPERM de esbuild en sandbox).
- QA visual Playwright (`web_game_playwright_client.mjs`):
  - `output/strategy-parchis-3ai-start-fixes/shot-0..2.png`
  - `output/strategy-parchis-3ai-start-fixes/state-0..2.json`
  - verificado en estado: `phase=await-roll` tras iniciar, `home=4` para todos los jugadores al arranque y `variant=parchis-4p-human-vs-3ai`.
## 2026-03-02 - Parchis: correccion posicion pasillos finales (verde/amarillo/azul)
- `src/games/parchis/boardModel.js` ajustado para que los pasillos finales apunten al lado correcto de la meta y no crucen al lado opuesto:
  - red: `[7,1] -> [7,6]`
  - blue: `[13,7] -> [8,7]`
  - yellow: `[7,13] -> [7,8]`
  - green: `[1,7] -> [6,7]`
- Resultado visual: cada color termina en su casilla de aproximacion propia alrededor de la meta (sin desplazamientos erraticos).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild en sandbox).
- Capturas de verificacion: `output/strategy-parchis-lanes-position-fix/shot-0.png` y `shot-1.png`.
## 2026-03-02 - Parchis: regla de doble 6 + secuencia obligatoria con 5
- `src/games/ParchisStrategyGame.jsx` actualizado en motor de turnos para reglas de dados solicitadas:
  - el turno extra ahora solo ocurre con `doble 6` (no con un 6 simple);
  - `sixStreak` y penalizacion de tercer 6 adaptadas a `tres dobles 6 consecutivos`;
  - cuando hay un `5` en cualquiera de los dos dados y quedan fichas en casa:
    - se fuerza primero `salida obligatoria` (step 5),
    - y se encola el otro dado para aplicarlo justo despues (`queuedDiceValues`).
- Se anadio pipeline de segundo dado pendiente:
  - nuevo estado `queuedDiceValues` (inicializacion, payload, limpieza en fin de turno),
  - activacion automatica del dado pendiente tras completar la salida obligatoria.
- Copy/UI sincronizados:
  - reglas prompt del componente actualizado (doble 6 + secuencia 5 + otro dado),
  - etiqueta de estado de racha renombrada a `Racha doble 6`.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild en sandbox).
- Playwright runtime check (`output/strategy-parchis-dice-rules-fix/state-0.json`):
  - caso detectado `dados 5 y 4` con `mandatoryEntry=true`, `steps=5`, `queuedDiceValues=[4]`.
- Playwright runtime check (`output/strategy-parchis-dice-rules-fix-queue/state-0.json`):
  - caso `dados 6 y 1` sin turno extra (pasa a `ai-blue`), confirmando que no se repite tirada con 6 simple.
## 2026-03-02 - Parchis: revision de bloqueo de ronda + regla de dobles
- Se reviso el reporte de "no empieza la siguiente ronda":
  - en prueba aislada larga (`output/strategy-parchis-round-stall-isolation/state-0.json`) la partida avanza por rondas completas sin bloqueo (turnCount progresa y rota por los 4 jugadores).
  - se detecto un edge-case real en la cola del segundo dado tras salida obligatoria con 5: si ese segundo dado quedaba sin jugadas, no se autoresolvia.
- Fix aplicado en `src/games/ParchisStrategyGame.jsx`:
  - `activateQueuedDieMove(...)` ahora calcula acciones legales y, si no hay ninguna, llama automaticamente a `resolveNoLegalActions(...)` para cerrar turno/continuar ronda sin quedarse en espera manual.
- Regla extra pedida implementada:
  - cualquier doble (`dado1 === dado2`) concede turno extra.
  - se mantiene la penalizacion especial para `tres dobles 6 consecutivos`.
  - textos de reglas y mensajes de turno extra actualizados (`Turno extra por dobles`).
- Ajuste tecnico adicional para simulacion IA:
  - `makeHypotheticalRollState(...)` marca doble de forma general (para valorar turno extra correctamente).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild en sandbox).
- QA Playwright:
  - `output/strategy-parchis-round-stall-isolation/state-0.json`: ronda fluye hasta volver a humano (`turnCount=5`) sin bloqueo.
  - logs muestran dobles con turno extra activo (ej: `IA Azul tira: Dados 4 y 4 (dobles).` seguido de nueva tirada de IA Azul).
## 2026-03-02 - Parchis: fix atasco IA al sacar primera ficha + dobles extra
- `src/games/ParchisStrategyGame.jsx`:
  - corregido scheduler IA para rearmar decision cuando cambia estado interno en el mismo `turn/phase` (evita bloqueo tras salida obligatoria + segundo dado);
  - `activateQueuedDieMove(...)` ahora autoresuelve `sin jugadas` para cerrar turno automaticamente;
  - regla de turno extra ampliada: cualquier doble (`dado1===dado2`) otorga turno extra;
  - mensajes/reglas sincronizados (`Turno extra por dobles`).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM en sandbox).
- Playwright: `output/strategy-parchis-round-stall-check-v3/state-0..7.json`.
- Confirmado: la IA no queda bloqueada al sacar primera ficha y la ronda avanza; dobles dan turno extra.

## 2026-03-03 - Parchis: suma de doble dado con una sola ficha activa + correccion de direccion
- `src/games/ParchisStrategyGame.jsx`:
  - corregida la direccion de avance visual/logica al mapear progreso de ficha a casilla de track (`progressToTrackIndex` ahora decrementa indice).
  - ajustada la heuristica de distancia (`getTrackDistance`) para mantener coherencia de amenaza/cobertura IA con el nuevo sentido de avance.
  - nueva resolucion de tirada `resolveRollSetup(...)` para unificar reglas:
    - salida obligatoria con 5 (manteniendo cola del otro dado),
    - suma de ambos dados cuando el jugador solo tiene una ficha activa (`ficha unica activa: d1 + d2`),
    - fallback al dado principal cuando la suma no tiene jugada legal.
  - `makeHypotheticalRollState(...)` sincronizado con la misma regla de suma/fallback para no desalinear la evaluacion de IA.
  - texto de reglas (`RULES_PROMPT`) y payload QA (`coordinates`) actualizados para reflejar el comportamiento real.
- Nota tecnica de skill:
  - el cliente del skill en `.../skills/develop-web-game/scripts/web_game_playwright_client.js` sigue fallando por ESM/CJS en este entorno; se uso `web_game_playwright_client.mjs` del repo (patron ya documentado previamente).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `EPERM` de esbuild en sandbox).
- Tests OK: `npm test` -> `10 files`, `29 tests` en verde.
- QA Playwright (parchis por hash directo):
  - `output/strategy-parchis-direction-dice-fix-hash/shot-0..5.png`
  - `output/strategy-parchis-direction-dice-fix-hash/state-0..5.json`
  - sin `errors-*.json`.
- QA Playwright extendida:
  - `output/strategy-parchis-direction-dice-fix-long/state-*.json` contiene eventos de suma activa:
    - `Tu (Rojo) tira: Dados 3 y 1. ficha unica activa: 3 + 1 = 4`
    - `Tu (Rojo) tira: Dados 2 y 6. ficha unica activa: 2 + 6 = 8`
    - `IA Verde tira: Dados 1 y 6. ficha unica activa: 1 + 6 = 7`
  - se observa avance por decremento de indice en humano tras salir (ej. `67 -> 65 -> 64 -> 60...`), consistente con el nuevo sentido esperado.

### TODO sugerido
- Añadir tests unitarios dedicados de parchis para:
  - regla de suma con una sola ficha activa (`6+4 => 10` cuando hay jugada legal),
  - fallback al dado principal cuando la suma no es legal,
  - correspondencia de sentido de avance en `progressToTrackIndex`.

## 2026-03-04 - Parchis: pared en salida sin bloqueo + render de doble ficha + ritmo mas suave
- `src/games/ParchisStrategyGame.jsx`:
  - nuevo helper `resolveBlockedMandatoryEntryState(...)` para resolver el caso en el que hay `mandatoryEntry` pero la salida esta bloqueada por pared propia.
  - `rollForPlayer(...)` actualizado:
    - si la salida obligatoria no tiene accion legal, reconduce automaticamente la jugada al otro dado (y, si procede, al principal) en vez de perder turno.
    - se registra mensaje/log explicito: `Salida bloqueada por pared en la salida...`.
  - `makeHypotheticalRollState(...)` sincronizado con la misma resolucion para mantener coherencia de evaluacion IA.
  - ritmo de IA y tiradas suavizado:
    - dificultad IA: `thinkMs` ajustado a `680 / 1020 / 1360` (facil/media/dificil),
    - jitter IA ampliado a `260ms`,
    - duracion de tirada a `980ms`,
    - refresco visual de caras de dado a `110ms`.
  - `RULES_PROMPT` actualizado con la regla de salida bloqueada por pared propia.
- `src/games/parchis/LudoBoard.jsx`:
  - deteccion de pared visual (`2` fichas del mismo color en la misma casilla) y layout dedicado:
    - separacion horizontal mayor,
    - radio de ficha ligeramente menor para que ambas se vean completas.
  - clase nueva por ficha en pared: `is-wall`.
- `src/styles.css`:
  - transicion de desplazamiento de ficha suavizada (`260ms -> 360ms`) para que los movimientos se perciban menos bruscos.
  - refinado visual para `ludo-token.is-wall` (contornos mas marcados).
  - animacion de dado en CSS ajustada (`800ms -> 980ms`).

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `EPERM` de esbuild en sandbox).
- Tests OK: `npm test` (`10` files, `29` tests en verde).
- QA Playwright:
  - `output/strategy-parchis-wall-entry-speed-fix/shot-0..17.png`
  - `output/strategy-parchis-wall-entry-speed-fix/state-0..17.json`
  - sin `errors-*.json`.
- Evidencia del fix de pared en salida (no bloqueo):
  - `state-11.json`: `message = "Salida bloqueada por pared en la salida. Se aplica el otro dado (5)."`
  - `state-16.json`: log `IA Azul: Salida bloqueada por pared en la salida. Se aplica el otro dado (2).`
- Evidencia visual de pared con dos fichas visibles:
  - `shot-11.png` (pared azul en salida `C17` y pared verde en `C51` con ambas fichas visibles y separadas).

## 2026-03-04 - Parchis: fix segundo dado en dobles (humano + IA)
- `src/games/ParchisStrategyGame.jsx`:
  - `resolveRollSetup(...)` ahora encola el segundo dado cuando hay dobles y no aplica ni salida obligatoria ni modo suma por ficha unica (`queuedDiceValues: [auxDie]`).
  - `activateQueuedDieMove(...)` generalizado para cualquier dado pendiente (mensaje neutral `Se aplica el dado pendiente (...)`).
  - reglas visibles (`RULES_PROMPT`) actualizadas para reflejar que en dobles se juegan ambos dados y luego se mantiene turno extra por dobles.
- Resultado funcional:
  - al tirar, por ejemplo, `2/2`, se ejecuta el primer `2`, despues se activa automaticamente el segundo `2` y permite volver a escoger ficha para ese segundo movimiento;
  - aplica tanto al jugador humano como a la IA.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por `EPERM` en sandbox).
- Tests OK: `npm test` (`10` files, `29` tests en verde).
- QA Playwright extendida:
  - `output/strategy-parchis-doubles-second-die-fix/shot-0..27.png`
  - `output/strategy-parchis-doubles-second-die-fix/state-0..27.json`
  - sin `errors-*.json`.
- Evidencia en logs de humano e IA:
  - `state-7.json`: `Tu (Rojo): Se aplica el dado pendiente (3).`
  - `state-4.json`: `IA Azul: Se aplica el dado pendiente (6).`
  - `state-9.json`: `Tu (Rojo): Se aplica el dado pendiente (2).`
  - `state-21.json`: `IA Azul: Se aplica el dado pendiente (1).`
## 2026-03-04 - Poker: ritmo IA mas lento + mas tiempo de mensaje fin de mano
- `src/games/PokerTexasHoldemGame.jsx`:
  - Aumentado retardo entre manos automatico (`AUTO_NEXT_MS`) de `3400` a `5400` para que el overlay/mensaje final de ronda permanezca visible mas tiempo antes de iniciar la siguiente.
  - Ajustados tiempos base de decision IA para desacelerar transiciones de jugadas:
    - `rookie`: `520 -> 900 ms`
    - `tactical`: `820 -> 1300 ms`
    - `expert`: `1120 -> 1750 ms`
  - Introducidas constantes de control de ritmo:
    - `AI_THINK_JITTER_MS = 320` (antes jitter hardcodeado de `220`)
    - `AI_WATCHDOG_MS = 4400` (antes watchdog fijo `2800`)
  - El timer de turno IA ahora usa `randomInt(AI_THINK_JITTER_MS)` y el watchdog respeta `AI_WATCHDOG_MS` para evitar ejecuciones prematuras al haber incrementado los tiempos.

### Validacion
- Build OK: `npm run build` (ejecutado fuera de sandbox por `EPERM` de esbuild en sandbox).
- Playwright poker OK:
  - `output/strategy-poker-ai-speed-slower/shot-0..3.png`
  - `output/strategy-poker-ai-speed-slower/state-0..3.json`
  - sin archivos `errors-*.json`.
- Evidencia funcional:
  - `state-0.json` y `state-1.json` en `stateMode: hand-over` muestran mensaje final (`Siguiente mano automatica...`) visible durante mas tiempo antes del avance.
## 2026-03-04 - Poker: lectura historica por rival integrada en IA tactica/experta
- `src/games/PokerTexasHoldemGame.jsx` ampliado con memoria de comportamiento por jugador (`readStats`) persistente entre manos:
  - `handsObserved`, `voluntaryHands` (VPIP), `raises`, `preBetRaises`, `postBetRaises`, `reraises`,
  - `calls`, `callsFacingRaise`, `checks`, `folds`, `foldsFacingRaise`, `allIns`,
  - `showdowns`, `showdownWins`, `potsWonWithoutShowdown`.
- Durante cada accion de apuesta se registran eventos de lectura (call/raise/fold/all-in) y flags de mano (`voluntaryThisHand`, `aggressiveThisHand`).
- Al cerrar cada mano (`finalizeHand`) se consolidan estadisticas historicas por rival mediante `applyReadStatsAfterHand(...)`.
- Nueva capa de interpretacion de rivales para IA:
  - `readMetricsFromStats(...)` + `summarizeOpponentReads(...)` generan perfil agregado por oponentes: `looseness`, `foldToRaise`, `aggression`, `showdownStrength`, `stealRate`, `sampleConfidence`.
  - `buildAiBetContext(...)` incorpora estos datos para ajustar `perceivedFoldEquity` y `bluffCatchBonus`.
- IA adaptativa actualizada:
  - faroles/re-faroles (`shouldOpenBluff`, `shouldRebluff`) ahora dependen tambien del perfil observado de rivales,
  - semi-farol ajustado por tendencia de fold rival,
  - calls/folds incluyen `bluffCatchBonus` y defensa minima condicionada a evidencia historica (`sampleConfidence`).
- `render_game_to_text` enriquecido:
  - cada asiento expone `reads` con metricas (`hands`, `vpip`, `aggression`, `foldToRaise`, `showdownWinRate`, `stealRate`) para QA.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild en sandbox).
- Playwright OK:
  - `output/strategy-poker-opponent-read-check/shot-0..4.png`
  - `output/strategy-poker-opponent-read-check/state-0..4.json`
  - sin `errors-*.json`.
- Evidencia en estado:
  - `state-1.json` y `state-4.json` muestran `seats[].reads` con valores acumulados (ej. `hands`, `vpip`, `aggression`, `showdownWinRate`) creciendo entre manos.
## 2026-03-04 - Poker: ampliacion de metas de fichas
- `src/games/PokerTexasHoldemGame.jsx` actualizado para ofrecer mas niveles de `chipTarget` por stack inicial.
- Nuevas opciones:
  - stack `80`: `100, 120, 130, 150, 170, 190, 220, 250`
  - stack `120`: `150, 170, 180, 200, 220, 240, 260, 300, 340, 380`
  - stack `160`: `200, 230, 260, 300, 340, 380, 420, 480, 540, 600`
- No se cambia la logica de compatibilidad: `ensureTargetForStack(...)` sigue seleccionando un valor valido si el target previo no existe para el nuevo stack.
## 2026-03-04 - Poker: ampliacion de stacks iniciales seleccionables
- Se amplio `STARTING_STACK_OPTIONS` para permitir elegir mas cantidades al iniciar partida:
  - `60, 80, 100, 120, 140, 160, 200, 240, 300, 400`.
- Se sustituyo el mapa fijo de targets por generacion automatica por stack:
  - `TARGET_MULTIPLIERS` + `buildTargetOptionsForStack(stack)`.
  - `TARGET_OPTIONS_BY_STACK` ahora se construye para todos los stacks soportados.
- Resultado: al cambiar `Stack inicial`, siempre hay varios objetivos de fichas coherentes y seleccionables.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild en sandbox).
## 2026-03-04 - Poker i18n runtime audit (mensajes mixtos)
- Auditados mensajes runtime del poker (logs, intents y mensajes de turno) para detectar textos parcialmente traducidos en locale `en`.
- Corregido orden de reemplazo en `localizeRuntimeText` para que `"actua. Turno para"` se traduzca completo y no quede mixto (`"AI 4 acts. Turn for You."`).
- Añadidas traducciones faltantes de intents:
  - `Sube a X.` -> `Raises to X.`
  - `Iguala X.` -> `Calls X.`
  - `Descarta X.` -> `Discards X.`
- Añadidas variantes faltantes de logs/runtime:
  - `pasa.` -> `checks.`
  - `Sin fichas` -> `No chips`
  - `Se sirve.` y `Se sirve sin descartar.` ya cubiertas en mayúscula/minúscula.
- Nota de validación: no se pudo completar build en sandbox por `esbuild spawn EPERM` sin elevación.
- Extendida la auditoría de i18n con validación scriptada de frases runtime (simulando `localizeRuntimeText` en `en`) para detectar mezclas ES/EN en producción.
- Correcciones adicionales: `lidera con` -> `leads with`, y normalización de conjugaciones con sujeto `You` (ej. `You win`, `You lead`, `You fold`, `You check`, etc.).
## 2026-03-04 - Poker responsive movil (portrait + landscape)
- Implementado responsive especifico para poker con clases dinamicas (`poker-mobile`, `poker-mobile-portrait`, `poker-mobile-landscape`) derivadas del viewport real.
- Anadido aviso contextual de orientacion (descartable) en portrait movil: informa que se puede jugar en vertical y que girar amplia la mesa, sin forzar rotacion.
- Rehecha la capa movil del layout:
  - estado y marcador en carrusel horizontal;
  - mesa en grid adaptativo (2 columnas portrait, 3 landscape);
  - board y asiento humano priorizados al inicio;
  - acciones tactiles con panel sticky y botones mas altos.
- Ajustes adicionales de legibilidad/compactacion en cartas, seats y tipografias para 390x844 y 844x390.
- Validacion automatizada:
  - Playwright mobile portrait/landscape contra `#game=strategy-poker-holdem-no-bet`.
  - capturas: `output/strategy-poker-mobile-responsive/mobile-portrait-viewport.png` y `mobile-landscape-viewport.png`.
  - verificado que el aviso aparece solo en portrait y se oculta en landscape.
- Nota tecnica: `npm run build` en sandbox sigue fallando por `esbuild spawn EPERM` (limitacion de entorno), no por error de sintaxis de cambios.
## 2026-03-04 - Domino: motor clasico 4P por parejas + mesa renovada
- Reescrito `src/games/DominoStrategyGame.jsx` con motor de domino clasico fiel a reglas de mesa:
  - 28 fichas doble-seis, reparto 7 por jugador, 4 asientos (`player`, `right`, `partner`, `left`).
  - Ronda 1 abre quien tiene `6|6`; rondas siguientes abre el jugador a la derecha del inicio anterior.
  - Turnos circulares, jugadas legales por extremos, pases forzados y seleccion de extremo por teclado/UI.
  - Fin de ronda por `domino` o `tranca` (pases consecutivos de todos y cierre por numero agotado en extremos).
  - Puntuacion por equipos (parejas): el equipo ganador suma los puntos de la mano rival.
  - IA multi-asiento por niveles: facil (determinista simple), media (heuristica), dificil (minimax por equipos).
  - `render_game_to_text` ampliado con estado de equipos, manos por asiento, layout de cadena y metadatos de ronda.
- Rehecha la UI de mesa para acercarla a referencia visual:
  - zonas de jugadores arriba/izquierda/derecha y mano humana abajo,
  - HUD por equipos y pips en mano,
  - cadena central en tapete con layout serpenteante y dobles perpendiculares,
  - indicadores de turno y estado de IA pensando.
- Estilos nuevos/ajustes en `src/styles.css` (`domino-strategy-pro`) para tapete, ring de asientos, backs compactos y cadena absoluta con scroll.
- Copys actualizados para domino en:
  - `src/data/games.js`
  - `src/components/GamePlayground.jsx`
  - `src/games/registry.jsx`

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de `esbuild` en sandbox).
- Playwright QA OK con cliente local equivalente (`web_game_playwright_client.mjs`) sobre `#game=knowledge-domino-chain`:
  - `output/strategy-domino-upgrade/shot-0.png..shot-2.png`
  - `output/strategy-domino-upgrade/state-0.json..state-2.json`
  - estado confirma `variant: domino-classic-4p-pairs`, asientos 4P, puntuacion por equipos, `chainLayout` serpenteante y turnos IA/humano.
- Nota: el cliente de la skill en `C:\Users\hugoe\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js` fallo en este entorno al ejecutarse como `.js` ESM; se uso el cliente `.mjs` equivalente del repo para completar la validacion.
## 2026-03-04 - Domino: nombres Usuario/Compañero + highlight de jugadas + modos 1IA/2IAs + IA mas lenta
- `src/games/DominoStrategyGame.jsx` actualizado de motor fijo 4P a motor multimodo con `modeId`:
  - Modos nuevos:
    - `duel`: `Usuario vs 1 IA` (`seats: player,right`, reparto completo 14/14).
    - `triad`: `Usuario vs 2 IAs` (`seats: player,right,left`, reparto completo 10/9/9).
    - `pairs`: se mantiene `Usuario + Compañero vs 2 IAs` (4P por parejas).
  - Estado/rondas ahora dependen de `modeConfig` (asientos activos, orden de turnos, equipos, scoring, tranca y cierre).
  - Marcador y resolucion de ronda generalizados para 2, 3 y 4 participantes.
  - IA ralentizada para mejorar UX:
    - `easy`: `1100 ms`
    - `medium`: `1650 ms`
    - `hard`: `2300 ms`
  - Renombrados asientos visibles:
    - jugador humano: `Usuario`
    - pareja IA: `Compañero`
  - Nuevo selector de `Modo de partida` en config (cambiar modo reinicia partida).
- Highlight visual ampliado:
  - Se mantiene resaltado fuerte de ficha seleccionada en mano (`Seleccionada`).
  - Se mantiene highlight de ultima ficha del usuario en tablero.
  - Aniadido highlight dedicado para la ultima ficha puesta por `Compañero` (`lastPartnerMoveTileId` + badge visual en tablero).
  - Resumen textual bajo toolbar ahora incluye ultima jugada del Usuario y del Compañero (si aplica por modo).
- `render_game_to_text` ampliado:
  - `modeId`, `modeLabel`, `variant` dinamico.
  - `lastPartnerMoveTileId`, `lastPartnerMoveSide`.
  - `hands.counts` dinamico por asientos activos del modo.

### Validacion
- Build OK: `npm run build` (fuera de sandbox por EPERM de esbuild en sandbox).
- Playwright (cliente del repo) OK en modo parejas:
  - `output/strategy-domino-modes-highlight/pairs/shot-0..3.png`
  - `output/strategy-domino-modes-highlight/pairs/state-0..3.json`
  - Evidencia de highlight de companero: `state-1.json` contiene `lastPartnerMoveTileId` no nulo.
- Validacion visual full-page adicional (Playwright custom) de modos:
  - `output/strategy-domino-modes-highlight/validation/pairs-full.png`
  - `output/strategy-domino-modes-highlight/validation/duel-full.png`
  - `output/strategy-domino-modes-highlight/validation/triad-full.png`
  - Estados asociados: `pairs-state.json`, `duel-state.json`, `triad-state.json`.
## 2026-03-04 - Domino i18n + responsive movil (en curso)
- `DominoStrategyGame.jsx`:
  - eliminado `IS_ES` sin uso;
  - anadidos textos i18n para badges de ultima jugada (`lastPlayerBadge`, `lastPartnerBadge`) en ES/EN;
  - anadida clase raiz `locale-${LOCALE}` para variantes de estilo por idioma;
  - moved labels de ultima jugada al JSX (sin texto hardcodeado en CSS).
- `styles.css` (bloque domino pro):
  - anadidas rejillas por modo (`mode-duel`, `mode-triad`) para evitar huecos y mejorar composicion;
  - reemplazados pseudo-elementos con texto fijo por `.domino-board-badge` visualmente equivalente;
  - anadido bloque `domino-mobile` + `domino-mobile-portrait/landscape` para:
    - mano horizontal con scroll/tap targets mayores,
    - toolbar sticky tactil,
    - paneles de estado/marcador en scroll horizontal,
    - ajuste de alturas de cadena y asientos segun orientacion.
- Pendiente inmediato: build + validacion Playwright y ajuste fino visual si aparece regression.
## 2026-03-04 - Domino: cierre i18n completo + responsive movil validado
- Internacionalizacion Domino completada por locale del navegador:
  - `LOCALE` se fija por `navigator.language` (`es*` => espanol, resto ingles).
  - textos de UI/runtime/reglas ya mapeados a `T` en `DominoStrategyGame.jsx`.
  - eliminada variable muerta `IS_ES`.
- Texto visible en tablero sin hardcode en CSS:
  - eliminados pseudo-elementos con `content: "Tu jugada" / "Companero"`.
  - badges migrados a JSX con i18n: `T.ui.lastPlayerBadge`, `T.ui.lastPartnerBadge`.
- Responsive movil reforzado en `src/styles.css` para domino pro:
  - layouts por modo (`mode-duel`, `mode-triad`) para evitar huecos en asientos.
  - bloque `domino-mobile` + `domino-mobile-portrait` + `domino-mobile-landscape`:
    - mano horizontal con scroll/tap targets ampliados,
    - toolbar sticky tactil,
    - marcador/status con scroll horizontal,
    - ajustes de altura del area de cadena y compactacion de asientos.
- Limpieza tecnica:
  - eliminado BOM UTF-8 accidental al inicio de `DominoStrategyGame.jsx`.

### Validacion final
- Build OK: `npm run build` (fuera de sandbox por `esbuild spawn EPERM` en sandbox).
- Playwright (cliente del repo) OK:
  - `output/strategy-domino-i18n-mobile-check/desktop/shot-0..3.png`
  - `output/strategy-domino-i18n-mobile-check/desktop/state-0..3.json`
  - sin `errors-*.json`.
- Playwright movil (captura viewport real del modal domino):
  - `output/strategy-domino-i18n-mobile-check/mobile/domino-mobile-portrait-v3.png`
  - `output/strategy-domino-i18n-mobile-check/mobile/domino-mobile-landscape-v3.png`
  - probes: `...-v3-probe.json` confirman `overlay=true`, `runtime=true`, `hash=#game=knowledge-domino-chain`.
- Capturas extra tramo inferior (mano + toolbar):
  - `output/strategy-domino-i18n-mobile-check/mobile/domino-mobile-portrait-v4-bottom.png`
  - `output/strategy-domino-i18n-mobile-check/mobile/domino-mobile-landscape-v4-bottom.png`.
## 2026-03-04 - Domino mobile portrait: fix de solapes + mano visible
- Ajustado `src/styles.css` en bloque `domino-mobile`/`domino-mobile-portrait` para corregir UX vertical:
  - configuracion en una sola columna en portrait (evita solape de desplegables largos),
  - `label/select` con `min-width:0` y `width:100%` para evitar overflow,
  - altura del area de cadena reducida en portrait (`24dvh..33dvh`) para liberar espacio de juego,
  - layout de asientos en portrait por modo:
    - `pairs`: top + chain + (`left`/`right`) en la misma fila + bottom,
    - `triad`: chain + (`left`/`right`) + bottom,
  - mano del usuario en portrait convertida a grid 4 columnas (sin scroll horizontal) para mostrar mas fichas simultaneas,
  - compactacion de badges/hints sobre fichas para evitar superposicion.

### Validacion
- Build OK: `npm run build`.
- Playwright mobile (modal domino real, viewport 390x844 y 844x390):
  - `output/strategy-domino-i18n-mobile-check/mobile-fix-pass2/domino-portrait-top.png`
  - `output/strategy-domino-i18n-mobile-check/mobile-fix-pass2/domino-portrait-bottom.png`
  - `output/strategy-domino-i18n-mobile-check/mobile-fix-pass2/domino-landscape-top.png`
  - `output/strategy-domino-i18n-mobile-check/mobile-fix-pass2/domino-landscape-bottom.png`
  - `probe` en ambos: `overlay=true`, `runtime=true`, sin `errors-*.json`.
- Evidencia visual clave: en portrait (`domino-portrait-bottom.png`) se ven 7 fichas del usuario en rejilla, sin solape de desplegables.
## 2026-03-04 - Poker mobile: compactacion extrema de configuracion
- `src/games/PokerTexasHoldemGame.jsx`:
  - labels de configuracion envueltos en `<span>` para poder truncar texto y mantener altura minima en movil.
- `src/styles.css`:
  - compactado fuerte del bloque `.poker-mobile .poker-config`:
    - menor `margin-top` y `gap`,
    - labels con tipografia y line-height mas densos,
    - truncado con ellipsis en texto de label,
    - selects con menor `font-size`, `padding`, `min-height` y radio,
    - boton `poker-apply` reducido y en fila completa.
  - en `portrait` se usa rejilla de 2 columnas (cuando cabe) para minimizar altura total; en `<=420px` se mantiene fallback a 1 columna.
- Validacion:
  - Build OK: `npm run build` (fuera de sandbox por restricciones EPERM del entorno).
## 2026-03-04 - Poker mobile landscape: ajuste para evitar desplazamiento en interfaz principal
- `src/games/PokerTexasHoldemGame.jsx`:
  - nuevos textos i18n: `mobileExtraInfo` (ES/EN).
  - en movil horizontal se fuerzan cerrados los paneles de `Ajustes` y `Marcador` al detectar landscape (evita que tapen la mesa tras rotar).
  - los asientos IA en movil horizontal usan modo condensado siempre para reducir altura de la mesa.
  - bloque informativo inferior (`lectura`, `showdown`, `reglas`, `mensaje`) pasa a `details` compacto en landscape (`poker-mobile-extra`) para mantener la vista principal sin scroll.
- `src/styles.css`:
  - nuevos estilos `poker-mobile-extra` y variantes compactas en landscape.
  - compactacion agresiva en landscape de header/toggles/KPIs/configuracion/scoreboard/mesa/cartas/acciones.
  - `poker-actions-panel` deja de ser sticky en landscape y pasa a flujo normal compacto.
  - reducidas alturas maximas de paneles secundarios (`poker-mobile-extra`, `poker-mobile-log`) con scroll interno.
  - ocultado `poker-table-meta` en landscape para priorizar mesa + acciones.
- Validacion:
  - Build OK: `npm run build` (fuera de sandbox por restricciones EPERM del entorno).
## 2026-03-04 - Poker landscape mobile: modo vista completa tipo desktop
- `src/games/PokerTexasHoldemGame.jsx`:
  - en landscape movil se fuerzan visibles `Ajustes` y `Marcador` (equivalente a escritorio) y se ocultan toggles de paneles (solo se usan en portrait).
  - `poker-mobile-kpis` se limita a portrait para ahorrar altura en horizontal.
  - `hideAiSecondaryInfo` en asientos IA activo en horizontal movil para compactar mesa sin perder estado principal.
  - se elimina el plegado exclusivo de landscape para insight/showdown/rules/message: en horizontal vuelven a mostrarse como en escritorio.
  - anadido contenedor `poker-post-grid` para distribuir acciones + meta + insight + showdown + reglas + mensaje + log en rejilla compacta.
- `src/styles.css`:
  - anadido estilo base `poker-post-grid`.
  - landscape movil remaquetado para vista completa:
    - root con altura acotada a viewport y `overflow:hidden`,
    - compactacion extrema de header/config/status/scoreboard/mesa/botones,
    - rejilla de bloques inferiores en 3 columnas (`actions`, `meta`, `insight`, `rules`, `showdown`, `message`, `log`) con scroll interno por bloque.
- Validacion:
  - Build OK: `npm run build` (fuera de sandbox por restricciones EPERM del entorno).
## 2026-03-05 - Arcade Buscaminas IA (nuevo juego)
- Nuevo juego integrado: `arcade-buscaminas-classic`.
- Implementado `src/games/MinesweeperGame.jsx` con:
  - reglas clasicas de Buscaminas (numeros adyacentes, banderas e interrogacion),
  - primer click seguro garantizado,
  - flood-fill en celdas vacias,
  - victoria por apertura de todas las celdas seguras,
  - tablero por dificultad (Principiante/Intermedio/Experto) y modo Personalizado,
  - soporte teclado (`flechas`, `Enter/Espacio`, `F`, `A`, `H`, `R`),
  - bridge QA (`render_game_to_text` + `advanceTime`).
- IA por niveles incorporada:
  - basica: heuristica limitada + fallback aleatorio,
  - tactica: deduccion logica determinista,
  - avanzada: deduccion logica + estimacion de riesgo probabilistica.
- Integracion de catalogo/UI:
  - `src/data/games.js`: nuevo card y metadata ES/EN,
  - `src/games/registry.jsx`: registro de componente + hints de control ES/EN,
  - `src/components/GamePlayground.jsx`: mapeo jugable + hints ES/EN,
  - `src/assets/games/arcade-buscaminas-classic.svg`: nuevo arte de portada,
  - `src/styles.css`: bloque visual completo para UI/tablero de Buscaminas y ajustes moviles.
- QA ejecutada:
  - Build OK (fuera de sandbox por EPERM de esbuild): `npm run build`.
  - Playwright OK (fuera de sandbox por EPERM de Chromium):
    - comando con `web_game_playwright_client.mjs`, hash `#game=arcade-buscaminas-classic`, `--click-selector [data-cell='0-0']` y acciones `playwright-actions-arcade-minesweeper.json`.
    - artefactos: `output/arcade-buscaminas-check/shot-0..2.png` y `state-0..2.json`.
    - estado confirmado en `mode: playing`, celdas abiertas, banderas colocadas y `aiLastDecision` activo.
    - sin `errors-*.json` en la pasada.
- Nota: primera pasada Playwright quedaba en `mode: ready` porque la secuencia terminaba con `R` (reinicio). Se ajusto el payload para capturar estado jugable real.
- TODO sugerido:
  - anadir atajo visual para chording (click sobre numero cuando banderas coinciden) en ayudas UI,
  - ampliar localizacion del texto interno del componente a i18n central si se quiere coherencia total con resto de juegos.
## 2026-03-05 - Buscaminas reglas ampliadas (scoring + competitivo + movil)
- `src/games/MinesweeperGame.jsx` actualizado para alinear reglas de Buscaminas:
  - objetivo y fin de partida: abrir todas las casillas seguras o perder al detonar mina (se mantiene),
  - puntuacion incorporada por `celdas descubiertas + bonus de victoria - penalizacion por tiempo`,
  - modo `Competitivo` anadido con clasificacion local frente a 25 rivales y ranking en vivo,
  - export de estado QA ampliado (`score`, `scoringRule`, `matchMode`, `ranking`, `leaderboardTop5`),
  - soporte movil: toque rapido abre celda y pulsacion larga coloca bandera,
  - textos de estado/ayuda adaptados a las nuevas reglas.
- UX/Copys:
  - `src/styles.css`: estilos para leaderboard competitiva y ajustes HUD responsive.
  - `src/data/games.js`: metadata ES/EN del juego actualizada (scoring + competitivo 25 rivales + mobile long press).
  - `src/components/GamePlayground.jsx` y `src/games/registry.jsx`: hints de control actualizados con pulsacion larga y scoring competitivo.
- Validacion:
  - Build OK: `npm run build` (fuera de sandbox por restriccion EPERM de esbuild en sandbox).
  - Playwright QA OK (`web_game_playwright_client.mjs`) sobre `#game=arcade-buscaminas-classic`:
    - artefactos: `output/arcade-buscaminas-check/shot-0..2.png` + `state-0..2.json`.
    - `state-2.json` confirma `score` y `scoringRule` en modo casual.
  - Probe competitivo adicional (Playwright inline):
    - `output/arcade-buscaminas-check/competitive-check.png` + `competitive-state.json`.
    - estado confirma `matchMode: competitive`, `ranking`, y `leaderboardTop5` poblado.
  - sin `errors-*.json` en las pasadas.

## 2026-03-05 - Head Soccer overhaul (modos + entorno visual completo)
- Reestructurado `src/games/HeadSoccerGame.jsx` para soportar 4 modos jugables inspirados en Head Soccer clasico:
  - `Arcade`: cadena de desafios con eliminacion por derrota/empate.
  - `Supervivencia`: sin reloj, vidas por gol encajado y progresion por racha.
  - `Torneo`: fases de eliminacion (Cuartos/Semifinal/Final).
  - `Liga`: 10 jornadas con puntos (3-1-0), tabla de PJ/G/E/P/GF/GC/Pts.
- Añadida progresion por ronda con estado interno profesional:
  - `nextAction`, `seriesOutcome`, `roundResult`, `roundLabel`, `roundObjective`, `roundIndex/roundTotal`, `opponentName/opponentNation`.
  - Telemetria extendida en `render_game_to_text` (modo, ronda, rival, supervivencia, torneo, liga, objetivo de goles, etc.).
- Mejorada IA por contexto de modo/ronda con `modeBoost` para escalar reaccion, error, dash y decision de habilidad.
- UI React ampliada con selector de modo y panel de estado por modo (`head-soccer-mode-board`).
- `src/styles.css` actualizado con estilos nuevos para modo/progreso (chips, stats por modo y panel limpio).

## 2026-03-05 - Rediseño visual de estadio (referencia pixel art)
- Entorno del canvas rehecho para que el campo se sienta completo:
  - cielo con nubes dinamicas,
  - grada multicapa con publico,
  - focos laterales,
  - carteleria tipo arcade,
  - cesped por franjas,
  - lineas de campo/areas/centro,
  - porterias con red detallada.
- HUD superior limpiado y alineado con la referencia (marcador, tiempo/sin reloj, modo+ronda, rival, barras de momentum).

## 2026-03-05 - QA Playwright ejecutada
- Validacion principal de modo arcade:
  - `output/head-soccer-mode-upgrade/shot-0..2.png`
  - `output/head-soccer-mode-upgrade/state-0..2.json`
- Validacion de cambio de modos por UI y estado textual:
  - `output/head-soccer-survival-check/` (incluye estado con `gameMode.id = survival`)
  - `output/head-soccer-tournament-check/` (incluye estado con `gameMode.id = tournament`)
  - `output/head-soccer-league-check/` (incluye estado con `gameMode.id = league`)
- Simulacion completa de jornada de liga hasta fin de partido:
  - `output/head-soccer-league-fullmatch/state-0.json`
  - Resultado esperado verificado: `status=finished`, `nextAction=next`, `league.played=1`, `league.points=1` tras empate.
- QA visual final del estadio rediseñado:
  - `output/head-soccer-stadium-redesign-v2/shot-0..1.png`
  - `output/head-soccer-stadium-redesign-v2/state-0..1.json`

## TODO sugerido siguiente iteracion
- Cambiar sprites de jugador/cabeza por atlas pixel-art (actualmente figuras geometricas) para acercar aun mas el look de referencia.
- Añadir boton de pausa funcional en HUD superior (actualmente solo estilo de marcador/entorno).
- Revalidar `npm run build` cuando el entorno permita ejecucion fuera de sandbox sin interrupcion.

## 2026-03-05 - Rebuild crucigrama desde cero (fase implementacion)
- Reescrito `src/games/knowledge/crosswordGenerator.js` con motor nuevo:
  - contador propio `CROSSWORD_MATCH_COUNT = 12048` (>10k), independiente del resto de minijuegos.
  - selector de longitud maxima soportado en generacion (`6..10`).
  - rejilla coherente con longitudes mixtas por partida (slots diferentes en el mismo tablero).
  - incorporado lexico extendido para 9-10 letras y metadatos de catalogo (`CROSSWORD_LEXICON_META`).
- Integrado motor de pistas "prompt-driven" en el generador con estilos variados (indirecta, contexto, metafora, pregunta, cultura, sinonimo indirecto, juego conceptual), adaptacion por dificultad y bloqueo de pistas que revelen la palabra.
- Reescrito `src/games/knowledge/CrosswordKnowledgeGame.jsx`:
  - nuevo desplegable de longitud maxima 6-10.
  - nueva UX de cabecera + estado con max seleccionada.
  - reinicio aleatorio respetando la longitud seleccionada.
  - payload `render_game_to_text` actualizado con `maxWordLength` y total de partidas del crucigrama.
- Ajustados textos de producto/control:
  - `src/data/games.js` (descripcion del crucigrama actualizado a modo pro 10k+).
  - `src/components/GamePlayground.jsx` (hint de controles actualizado con selector max).
- Estilos nuevos para selector del crucigrama en `src/styles.css`.
- Pendiente inmediato: ejecutar tests/build, correr Playwright del crucigrama y revisar screenshots/estado/errores de consola.

## 2026-03-05 - Rebuild crucigrama (validacion)
- Test unitario especifico ejecutado: `npm run test -- src/games/knowledge/crosswordGenerator.test.js` (OK, 3/3).
- Build de produccion ejecutado: `npm run build` (OK).
- Validacion Playwright del crucigrama rehecho:
  - URL validada: `http://127.0.0.1:4173/#game=knowledge-crucigrama-mini`.
  - Artefactos principales:
    - `output/knowledge-crucigrama-max10-selector/shot-0.png`
    - `output/knowledge-crucigrama-max10-selector/shot-1.png`
    - `output/knowledge-crucigrama-max10-selector/state-0.json`
    - `output/knowledge-crucigrama-max10-selector/state-1.json`
  - Confirmado en estado serializado: `match.total = 12048` y `maxWordLength = 10` al seleccionar "Hasta 10 letras".
  - Capturas revisadas manualmente: selector visible, tablero 10x10, pistas renderizadas, escritura/check funcionando.
- Pendiente opcional futuro: ampliar lexico de 10 letras en ES para aumentar diversidad semantica en niveles maximos.
- 2026-03-05 (ajuste posterior): se sustituyeron las pistas del estilo de frase incompleta por plantillas directas solicitadas:
  - "Se dice de algo que ..."
  - "Persona que ..."
  - "Objeto usado para ..."
  Archivo: `src/games/knowledge/crosswordGenerator.js`.
  Validacion: `npm run test -- src/games/knowledge/crosswordGenerator.test.js` OK (3/3).

## 2026-03-05 - Crucigrama: personalizacion real de plantillas fijas de pistas
- Ajustado `src/games/knowledge/crosswordGenerator.js` para que el estilo `incomplete_phrase` mantenga exactamente los inicios:
  - `Se dice de algo que ...`
  - `Persona que ...`
  - `Objeto usado para ...`
- Nuevo pipeline de personalizacion por palabra en esas plantillas usando analisis de `word + pos + definition + synonyms`:
  - limpieza de conceptos heredados (`concepto relacionado con ...`, etc.),
  - seleccion de ancla semantica por entrada,
  - continuaciones distintas segun categoria gramatical (noun/verb/adjective/adverb).
- Evitado el formato generico no natural (ejemplo anterior: `Persona que amapola`).
- Test nuevo en `src/games/knowledge/crosswordGenerator.test.js` para validar que las pistas `incomplete_phrase`:
  - respetan una de las 3 plantillas fijas,
  - incluyen continuaciones personalizadas (no vacias ni triviales).

### Validacion
- `npm run test -- src/games/knowledge/crosswordGenerator.test.js` -> OK (4 tests).
- `npm run build` -> OK.
- Ronda Playwright de regresion crucigrama:
  - `output/knowledge-crucigrama-clues-personalized/shot-0.png`
  - `output/knowledge-crucigrama-clues-personalized/shot-1.png`
  - `output/knowledge-crucigrama-clues-personalized/state-0.json`
  - `output/knowledge-crucigrama-clues-personalized/state-1.json`
- Verificado en estado generado ejemplo de pista personalizada con plantilla fija:
  - `Se dice de algo que se asocia de forma natural con gallardete.`

## 2026-03-06 - Crucigrama: plantillas fijas tambien en ingles
- `src/games/knowledge/crosswordGenerator.js` actualizado para `incomplete_phrase` en `en` con las tres plantillas fijas:
  - `It is said of something that ...`
  - `Person who ...`
  - `Object used to ...`
- Anadida personalizacion por palabra en ingles (analisis de `word + pos + definition + synonyms`) para evitar continuaciones genericas.
- Se incorporaron helpers de limpieza/ancla semantica en ingles y fallback segun categoria gramatical.

### Validacion
- `npm run test -- src/games/knowledge/crosswordGenerator.test.js` -> OK (5 tests).
- `npm run build` -> OK.

## 2026-03-06 - Eliminacion de Pulse Prism Runner
- Eliminado `arcade-pulse-prism-runner` del catalogo y del playground:
  - `src/data/games.js`
  - `src/components/GamePlayground.jsx`
  - `src/games/registry.jsx`
- Eliminado el motor y sus recursos:
  - `src/games/RhythmPlatformerGame.jsx`
  - `src/games/rhythm-platformer/` (carpeta completa)
  - `src/assets/games/arcade-pulse-prism-runner.svg`
- Limpiados artefactos relacionados (acciones Playwright y salidas `output/*` del juego).
- Limpiado CSS global relacionado en `src/styles.css`.
- Verificacion final: no quedan referencias textuales a `arcade-pulse-prism-runner`, `Pulse Prism Runner`, `RhythmPlatformerGame` ni `rhythm-platformer` en el repo.
- Build validado: `npm run build` OK.

## 2026-03-06 - Base lexico 10k ES/EN para Wordle + Anagramas (fase 1)
- Nuevo modulo compartido `src/games/knowledge/knowledgeWordLexicon.js`:
  - deriva palabras desde `crosswordTermBank` y garantiza `10000` entradas por locale (`es`, `en`), longitudes `5..10`.
  - expone helpers de seleccion por `matchId`, set por locale, normalizacion de guesses, feedback Wordle y mezcla determinista para anagramas.
- Test nuevo `src/games/knowledge/knowledgeWordLexicon.test.js`:
  - valida conteo 10k por idioma, forma de entradas, determinismo por `matchId`, feedback con letras repetidas y anagramas.
- Validacion ejecutada: `npm run test -- src/games/knowledge/knowledgeWordLexicon.test.js` (OK, 5/5).

## 2026-03-06 - Nuevos juegos Conocimiento: Wordle + Anagramas (implementacion completa)
- Nuevos componentes:
  - `src/games/knowledge/WordleKnowledgeGame.jsx`
  - `src/games/knowledge/AnagramsKnowledgeGame.jsx`
- Integracion de variantes en `src/games/KnowledgeArcadeGame.jsx`:
  - `variant="wordle"`
  - `variant="anagramas"`
- Integracion de catalogo y runtime:
  - `src/data/games.js`: nuevos IDs `knowledge-wordle-pro` y `knowledge-anagramas-pro` (categoria `Conocimiento`) con copy ES/EN y foco 10k palabras.
  - `src/games/registry.jsx`: mapeo de componentes + hints ES/EN para ambos juegos.
  - `src/components/GamePlayground.jsx`: mapeo y hints ES/EN actualizados.
- Assets nuevos:
  - `src/assets/games/knowledge-wordle.svg`
  - `src/assets/games/knowledge-anagramas.svg`
- Estilos nuevos/responsive en `src/styles.css`:
  - themes `knowledge-wordle` y `knowledge-anagramas`,
  - grid/teclado/leyenda Wordle,
  - fichas y lista de intentos de Anagramas,
  - ajustes movil (`@media max-width: 640px`).
- QA actions nuevos:
  - `playwright-actions-knowledge-wordle.json`
  - `playwright-actions-knowledge-anagramas.json`

### Validacion tecnica
- `npm run test` -> OK (12 archivos, 43 tests).
- `npm run build` -> OK.

### QA Playwright
- Nota operativa: el cliente del skill en `C:\Users\hugoe\.codex\skills\develop-web-game\scripts\web_game_playwright_client.js` fallo por modo ESM fuera de paquete (`Cannot use import statement outside a module`).
- Fallback usado: cliente equivalente del repo `web_game_playwright_client.mjs`.
- Runs ejecutados:
  - `output/knowledge-wordle-check/` -> `shot-0..2.png`, `state-0..2.json`
  - `output/knowledge-anagramas-check/` -> `shot-0..2.png`, `state-0..2.json`
- Sin `errors-*.json` en ambos directorios.
- Estado serializado revisado: ambos juegos exponen `lexicon.counts.es=10000`, `lexicon.counts.en=10000` y `match.total=10000`.
- Ajuste posterior UX de entrada:
  - eliminado atajo conflictivo `R` en juegos de letras (Wordle/Anagramas) para no bloquear escritura de la letra `R`.
  - textos/hints actualizados en `WordleKnowledgeGame`, `AnagramsKnowledgeGame`, `games.js`, `registry.jsx` y `GamePlayground.jsx`.
- Anagramas: las propuestas con composicion de letras invalida ahora consumen intento y se registran como `Invalido` en historial.
- QA actions refinados para automatizacion:
  - `playwright-actions-knowledge-wordle.json` y `...-anagramas.json` ahora introducen 10 letras (cubre longitudes 5..10) y validan con Enter.
- Revalidacion final:
  - `npm run build` OK tras ajustes.
  - Playwright final (cliente repo) repetida en:
    - `output/knowledge-wordle-check/`
    - `output/knowledge-anagramas-check/`
  - `state-2.json` confirma interaccion activa en ambos (intentos usados > 0) y `lexicon.counts.es/en = 10000`.
  - capturas finales revisadas manualmente (`shot-2.png`) y sin `errors-*.json`.
