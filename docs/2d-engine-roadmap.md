# Roadmap 2D (Plataformas + Fighting)

## Objetivo
Migrar de minijuegos UI/DOM a una capa de videojuegos 2D de calidad de produccion para:
- Plataformas tipo Mario (scroll lateral, fisica y level design).
- Fighting tipo Street Fighter (hitboxes, frame windows, guardia, combos).

## Stack Objetivo
- Runtime de juego: `Phaser 3`.
- Audio runtime: `Howler`.
- Frontend host: `React + Vite` (con embedding de canvas por juego).
- QA automatizado: `Playwright + render_game_to_text + advanceTime`.
- Arte y animacion (pipeline recomendado): `Aseprite + TexturePacker`.
- Edicion de niveles (pipeline recomendado): `LDtk` o `Tiled`.

## Arquitectura propuesta
1. Capa SaaS (catalogo, detalle, navegacion):
- Continua en React.
- Cada juego monta un runtime encapsulado por componente.

2. Capa de motor:
- Cada modo Phaser vive en su propia escena con estado serializable.
- Contrato comun para QA:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`

3. Capa de gameplay:
- Modulos por genero:
  - `platformer`: movimiento, salto, colisiones, coleccionables, meta.
  - `fighter`: state machine, startup/active/recovery, guardia, combos.

4. Capa de contenido:
- Definicion de niveles, enemigos y tablas de balance en JSON.
- Assets versionados por tema y resolucion.

## Fases de implementacion
### Fase 1 - Fundacion
- Integrar Phaser en el proyecto.
- Establecer wrapper React para montar/desmontar canvas.
- Mantener telemetria QA via `render_game_to_text` y `advanceTime`.

### Fase 2 - Vertical Slice Plataformas
- Fisica arcade, camara de seguimiento, scroll lateral.
- Enemigos de patrulla, pisoton, vidas y timer.
- Objetivo de nivel con gating de coleccionables.

### Fase 3 - Vertical Slice Fighting
- 1v1 con HP, guardia y medidor.
- Ataques con ventanas de frame (startup/active/recovery).
- Input buffer y combo basico.
- IA de sparring para entrenamiento.

### Fase 4 - Produccion
- Migrar assets temporales a spritesheets reales.
- Integrar audio, VFX, animaciones por estado y tuning.
- Externalizar niveles/balance a archivos de datos.
- Expandir cobertura Playwright por escenarios.

## Criterios de calidad
- 60 FPS estables en desktop medio.
- Controles consistentes en teclado y touch.
- Estados de combate/movimiento trazables por JSON.
- Tests automatizados para bucles criticos de gameplay.
- Sin acoplar reglas de juego a componentes UI de React.

## Backlog recomendado
1. Integrar export/import de niveles con `LDtk`.
2. Añadir rollback-ready abstractions para futuro multiplayer.
3. Pipeline de audio (SFX por accion, mixer, ducking basico).
4. Modo entrenamiento en fighting (frame data overlay).
5. Herramienta interna de balance para ajustar dano/cooldowns.
