# RaceGame2DPro Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrar el juego RaceGame2DPro (Canvas 2D, 18 circuitos, IA por dificultad) dentro de la plataforma de juegos SaaS existente.

**Architecture:** El juego vive en `src/games/RaceGame2DPro.jsx` con su CSS en `src/games/RaceGame2DPro.css`. Se registra en `src/games/registry.jsx` y se añaden sus metadatos en `src/data/games.js`. El modal `GameLaunchModal` ya provee botón de cierre, por lo que el botón "Volver" interno del juego se elimina.

**Tech Stack:** React 18, Canvas 2D (nativo), CSS modules por clase BEM (`.race2dpro`), Vite

---

## Contexto importante

- La plataforma **no usa react-router-dom**; la navegación es por `window.location.hash`.
- `GameLaunchModal` renderiza `<ActiveGame />` sin props y ya tiene su propio botón de cierre.
- Los juegos se registran en dos lugares: `src/games/registry.jsx` (para el modal) y `src/components/GamePlayground.jsx` (componente legacy aún en uso).
- El CSS del juego ya está en `src/RaceGame2DPro.css` (616 líneas) y `main.jsx` lo importa desde ahí — hay que moverlo a `src/games/` y actualizar el import.

---

### Task 1: Mover el CSS al directorio correcto

**Files:**
- Modify: `src/main.jsx` — quitar import de `./RaceGame2DPro.css`
- Move: `src/RaceGame2DPro.css` → `src/games/RaceGame2DPro.css`

**Step 1: Copiar el CSS al directorio del juego**

```bash
cp src/RaceGame2DPro.css src/games/RaceGame2DPro.css
```

**Step 2: Eliminar el import en `src/main.jsx`**

Quitar la línea 5 de `src/main.jsx`:
```js
// ELIMINAR esta línea:
import "./RaceGame2DPro.css"
```

El archivo debe quedar:
```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 3: Eliminar el archivo CSS de la raíz de src**

```bash
rm src/RaceGame2DPro.css
```

**Step 4: Verificar que `src/games/RaceGame2DPro.jsx` importa el CSS correctamente**

La línea 6 del componente ya tiene:
```js
import "./RaceGame2DPro.css";
```
Esto resuelve a `src/games/RaceGame2DPro.css` — correcto, no tocar.

**Step 5: Commit**

```bash
git add src/main.jsx src/games/RaceGame2DPro.css
git rm src/RaceGame2DPro.css
git commit -m "feat: move RaceGame2DPro CSS to src/games/"
```

---

### Task 2: Corregir los imports rotos en RaceGame2DPro.jsx

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx:1-6` — eliminar imports incompatibles

**Contexto:** Las líneas 2-5 del archivo tienen imports que apuntan a módulos que no existen en esta plataforma:
- `react-router-dom` — no está instalado
- `../common/components/MinigameTutorial` — no existe
- `../../helpers/minigameTutorialTexts` — no existe
- `../../helpers/sourceMiniGamesImages` — no existe

**Step 1: Reemplazar el bloque de imports (líneas 1-6)**

```js
// ANTES (líneas 1-6):
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MinigameTutorial from "../common/components/MinigameTutorial";
import { tutorialTexts } from "../../helpers/minigameTutorialTexts";
import { sourceImages } from "../../helpers/sourceMiniGamesImages";
import "./RaceGame2DPro.css";

// DESPUÉS:
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./RaceGame2DPro.css";
```

**Step 2: Commit parcial (solo imports)**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "fix: remove incompatible imports from RaceGame2DPro"
```

---

### Task 3: Eliminar useNavigate y la pantalla de tutorial

**Files:**
- Modify: `src/games/RaceGame2DPro.jsx`

**Contexto:** En el componente principal `RaceGame2DPro()` (línea 674+):
- Línea 676: `const navigate = useNavigate();` — rompe en runtime
- Línea 677: `const MINIGAMES_HOME = "/minigames";` — solo se usaba con navigate
- Línea 680: `const [showTutorial, setShowTutorial] = useState(true);` — controla pantalla de tutorial
- Línea 694: `const tutorial = tutorialTexts["/minigames/race"]?.[lang];` — usa import roto
- Líneas 2416-2429: bloque `if (showTutorial)` que renderiza `<MinigameTutorial ...>`
- Línea 2441: botón "Volver" que llama `navigate(MINIGAMES_HOME)`

**Step 1: Eliminar navigate, MINIGAMES_HOME, showTutorial y tutorial (líneas 676-694)**

```js
// ELIMINAR estas líneas del cuerpo del componente:
const navigate = useNavigate();
const MINIGAMES_HOME = "/minigames";

// Tutorial / Setup
const [showTutorial, setShowTutorial] = useState(true);
```
y más abajo:
```js
// ELIMINAR:
const tutorial = tutorialTexts["/minigames/race"]?.[lang];
```

Dejar solo `const [showSetup, setShowSetup] = useState(true);` para el setup inicial.

**Step 2: Eliminar el bloque de render del tutorial (líneas 2416-2429)**

```js
// ELIMINAR este bloque completo:
if (showTutorial) {
  return (
    <MinigameTutorial
      title={tutorial?.title || t.title}
      description={tutorial?.description || ""}
      image={sourceImages(`./RaceGame.png`)}
      onStart={() => {
        setShowTutorial(false);
        setShowSetup(true);
      }}
      lang={lang}
    />
  );
}
```

**Step 3: Eliminar el botón "Volver" del setup (línea ~2441)**

```js
// ELIMINAR este botón del JSX del setup:
<button className="race2dpro__setupBack" onClick={() => navigate(MINIGAMES_HOME)} type="button">
  ⟵ {t.backHome}
</button>
```

También eliminar el contenedor `race2dpro__setupTop` si queda vacío, o simplemente quitar solo el botón.

**Step 4: Commit**

```bash
git add src/games/RaceGame2DPro.jsx
git commit -m "fix: remove tutorial screen and navigate usage from RaceGame2DPro"
```

---

### Task 4: Registrar el juego en registry.jsx

**Files:**
- Modify: `src/games/registry.jsx`

**Step 1: Añadir el import del componente**

Al final de los imports directos (después de la línea `import DominoStrategyGame`):
```js
import RaceGame2DPro from "./RaceGame2DPro";
```

**Step 2: Añadir al GAME_REGISTRY**

Añadir una entrada en el objeto `GAME_REGISTRY`:
```js
"racing-race2dpro": RaceGame2DPro,
```

**Step 3: Añadir control hints en CONTROL_HINTS_BY_LOCALE**

En el bloque `es`:
```js
"racing-race2dpro": "Joystick táctil izq. o teclado: arriba/abajo acelera/frena, izq/der gira. Espacio turbo. R reinicia.",
```

En el bloque `en`:
```js
"racing-race2dpro": "Left joystick or keyboard: up/down throttle/brake, left/right steer. Space turbo. R restart.",
```

**Step 4: Commit**

```bash
git add src/games/registry.jsx
git commit -m "feat: register RaceGame2DPro in game registry"
```

---

### Task 5: Registrar en GamePlayground.jsx (legacy)

**Files:**
- Modify: `src/components/GamePlayground.jsx`

**Step 1: Añadir el import**

```js
import RaceGame2DPro from "../games/RaceGame2DPro";
```

**Step 2: Añadir al objeto GAME_COMPONENTS**

```js
"racing-race2dpro": RaceGame2DPro,
```

**Step 3: Añadir control hints en CONTROL_HINTS_BY_LOCALE**

En el bloque `es`:
```js
"racing-race2dpro": "Joystick táctil izq. o teclado: arriba/abajo acelera/frena, izq/der gira. Espacio turbo. R reinicia.",
```

En el bloque `en`:
```js
"racing-race2dpro": "Left joystick or keyboard: up/down throttle/brake, left/right steer. Space turbo. R restart.",
```

**Step 4: Commit**

```bash
git add src/components/GamePlayground.jsx
git commit -m "feat: add RaceGame2DPro to GamePlayground legacy registry"
```

---

### Task 6: Crear el SVG del juego y añadir metadatos en games.js

**Files:**
- Create: `src/assets/games/race2dpro.svg`
- Modify: `src/data/games.js`

**Step 1: Crear el SVG placeholder (usar estilo del proyecto)**

```bash
cp src/assets/games/neon-drift.svg src/assets/games/race2dpro.svg
```
*(Reutilizamos un SVG existente como imagen temporal para el catálogo)*

**Step 2: Añadir el import en `src/data/games.js`**

Al inicio del archivo, junto a los demás imports:
```js
import race2dproImage from "../assets/games/race2dpro.svg";
```

**Step 3: Añadir la entrada del juego en el array `games`**

Añadir dentro del array `games`, en la sección de juegos de carreras (junto a `racing-neon-lanes`):

```js
{
  id: "racing-race2dpro",
  image: race2dproImage,
  sessionTime: "5-15 min",

  title: "Race 2D Pro",
  category: "Carreras",
  tagline: "18 circuitos, IA por dificultad, parrilla de salida y colisiones reales.",
  description:
    "Juego de carreras 2D con motor Canvas nativo. Elige entre 18 circuitos de distintos entornos, configura la dificultad de la IA, el número de rivales y las vueltas. Semáforo de salida, física de grip y colisiones entre coches.",
  objective_es: "Termina la carrera en primera posición superando a todos los rivales antes de que completen sus vueltas.",
  howToPlay_es: "Arriba/abajo para acelerar y frenar, izquierda/derecha para girar. En móvil: joystick táctil izquierdo + botones derecha. Espacio activa el turbo. R reinicia la carrera.",
  highlights: [
    "18 circuitos con distintos entornos (costa, bosque, desierto, nieve y más).",
    "3 niveles de IA: fácil, medio y difícil con diferencias reales de trazada.",
    "Parrilla de salida con semáforo y posicionamiento en cuadrícula.",
    "Colisiones entre coches y límite de pista con grip por entorno.",
    "Joystick táctil para móvil y teclado en escritorio.",
  ],
  difficulty: "Media",
  multiplayer: "Solo vs IA",
  viability: "Alta: motor Canvas 2D nativo, sin dependencias externas de juego.",
  visualStyle: "Circuito 2D cenital con degradados de entorno y HUD minimalista.",
  techFocus: "Canvas 2D, física de vehículo, IA de carrera por dificultad, spline de pista.",

  category_en: "Racing",
  tagline_en: "18 circuits, AI by difficulty, starting grid and real collisions.",
  description_en:
    "2D racing game with a native Canvas engine. Choose from 18 circuits across different environments, configure AI difficulty, number of rivals and laps. Starting grid with traffic lights, grip physics and car-to-car collisions.",
  objective_en: "Finish the race in first place by beating all rivals before they complete their laps.",
  howToPlay_en: "Up/down to accelerate and brake, left/right to steer. On mobile: left touch joystick + right buttons. Space activates turbo. R restarts the race.",
  highlights_en: [
    "18 circuits across different environments (coast, forest, desert, snow and more).",
    "3 AI levels: easy, medium and hard with real line-racing differences.",
    "Starting grid with traffic lights and grid-box positioning.",
    "Car-to-car collisions and track boundary with environment-based grip.",
    "Touch joystick for mobile and keyboard on desktop.",
  ],
  difficulty_en: "Medium",
  multiplayer_en: "Solo vs AI",
  viability_en: "High: native Canvas 2D engine, no external game dependencies.",
  visualStyle_en: "Top-down 2D circuit with environment gradients and minimal HUD.",
  techFocus_en: "Canvas 2D, vehicle physics, difficulty-based race AI, track spline.",
},
```

**Step 4: Commit**

```bash
git add src/assets/games/race2dpro.svg src/data/games.js
git commit -m "feat: add RaceGame2DPro metadata and asset to game catalog"
```

---

### Task 7: Verificación final

**Step 1: Arrancar el servidor de desarrollo**

```bash
npm run dev
```

**Step 2: Verificar que el catálogo muestra el juego**

- Abrir `http://localhost:5173`
- Confirmar que "Race 2D Pro" aparece en la grid
- Filtrar por categoría "Carreras" y verificar que aparece

**Step 3: Verificar que el juego se lanza sin errores de consola**

- Hacer clic en "Race 2D Pro"
- En el modal, confirmar que carga el setup screen (pantalla de configuración de carrera)
- No debe haber errores en la consola del navegador

**Step 4: Verificar gameplay básico**

- Configurar una carrera (3 vueltas, dificultad media, aleatorio)
- Pulsar "Empezar carrera"
- Confirmar que el canvas renderiza la pista y los coches
- Confirmar que teclado/touch responden

**Step 5: Commit final si hay ajustes**

```bash
git add -p
git commit -m "fix: final adjustments after RaceGame2DPro integration verification"
```
