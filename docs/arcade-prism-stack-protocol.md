# Prism Stack Protocol

Juego arcade original de bloques descendentes para `plataforma-juegos-saas`.

## Diferenciacion deliberada

- Matriz `9x18`, no `10x20`.
- Piezas `pentomino` propias de 5 celdas, no el set clasico de tetrominos.
- Sin `ghost piece`.
- Recurso tactico propio `Pulse`: elimina la celda superior de la columna mas alta y congela la gravedad brevemente.
- Direccion visual propia: forja cromatica, prismas de vidrio, HUD de laboratorio y copy distinto.

## Estructura tecnica

- `index.jsx`: shell React, overlays, side panels, touch controls y QA bridge.
- `runtime.js`: game loop fijo, input, gravedad, locks, puntuacion, Pulse y persistencia.
- `core/logic.js`: rotaciones, colisiones, limpieza de bandas, scoring y serializacion.
- `core/pieces.js`: set de piezas pentomino, colores y matrices de preview.
- `render/drawScene.js`: dibujo Canvas del escenario y tablero.
- `services/storage.js`: best score y best bands en `localStorage`.
- `services/audio.js`: sintetizador ligero para start, move, rotate, clear, pulse y game over.

## QA hooks

- `window.render_game_to_text()` publica:
  - filas visibles serializadas,
  - pieza activa,
  - cola,
  - score/bandas/fase,
  - estado de Pulse y presion.
- `window.advanceTime(ms)` avanza el runtime en pasos deterministas de `60 FPS`.

## Controles

- `A/D` o flechas laterales: desplazar.
- `S` o flecha abajo: soft drop.
- `W`, `X` o flecha arriba: rotacion horaria.
- `Z`: rotacion antihoraria.
- `Space`: hard drop.
- `C`: Pulse.
- `P`: pausa.
- `R`: nueva sesion.
- `M`: audio.
- `F`: pantalla completa.
