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
- Añadido audio sintetizado por evento en plataformas: salto, dash, moneda, pisoton, dano, denegado en meta, victoria/derrota.
- Mejorado escenario de plataformas con fondo multicapa (cielo degradado, montanas y profundidad).
- Reescrito `FighterGame` con luchadores humanos, poses por estado (`idle/move/jump/guard/light/heavy/special/stunned/ko`) y feedback visual de impacto.
- Añadido audio sintetizado en lucha: ataque, hit, block, guard break, salto, ko y empate.
- Incluidas teclas alternativas para pruebas automáticas en fighting (`space` jab, `enter` heavy, `B` special).
- Actualizados textos de control y fichas de juego para reflejar el nuevo enfoque audiovisual.
- Pendiente: validar build y ejecutar bucles Playwright de plataforma y fighting con inspeccion de screenshots/estado.
