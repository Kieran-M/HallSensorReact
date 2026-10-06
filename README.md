# HallSim (React)

Vite + React + Three.js frontend for the Hall sensor simulator.

## Requirements

- Node.js **20+** (24 recommended; see `.nvmrc`)
- npm 10+ (comes with Node)

Companion API: `../HallSensorBackend` (must be running for Simulate).

## Setup

```bash
cd HallSensorReact
cp .env.example .env   # optional; defaults already point at localhost:8000
npm ci                 # clean install from package-lock.json
```

If `npm ci` fails because the lockfile was regenerated locally, use `npm install` once, commit the updated `package-lock.json`, then prefer `npm ci` thereafter.

## Scripts

```bash
npm run dev       # Vite at http://localhost:5173
npm run build     # production ESM chunks -> dist/
npm run preview   # serve dist/
npm run lint      # ESLint
```

Typecheck (project references):

```bash
npx tsc --noEmit -p tsconfig.app.json
```

## Host-site embed (ESM)

HallSim is built as **portable ESM** (`base: './'`) and does **not** use the browser History API or a URL router. In-app screens (presets / design / results) are Zustand view state only, so the parent diodes.com page keeps ownership of navigation.

After `npm run build`:

- Standalone: open `dist/index.html` (or host the `dist/` folder)
- Embed API: import the generated `dist/assets/embed-*.js` entry:

```js
import { mountHallSim } from "./assets/embed-XXXXXXXX.js";

const host = document.getElementById("hallsim-root");
const { unmount } = mountHallSim(host);

// when leaving the page / tearing down the widget:
// unmount();
```

Serve `dist/` (including hashed `assets/*` chunks) from the same origin/path prefix the embed script uses, so relative chunk imports resolve.

Heavy 3D / chart code is code-split and only fetched when the user enters the design workspace (or custom setup). Hovering “Open Design” / “Start custom setup” prefetches those chunks.

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `VITE_SIMULATION_API_URL` | `http://localhost:8000` | Backend origin for `/simulate` |

## Local full stack

1. Start the backend (`uvicorn app.main:app --reload --port 8000` in `HallSensorBackend`)
2. `npm run dev` in this repo
3. Open http://localhost:5173
