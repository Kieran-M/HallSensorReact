# HallSim (React)

Vite + React + Three.js frontend for the Hall sensor simulator.

## Requirements

- Node.js **20+** (24 recommended; see `.nvmrc`)
- npm 10+

Companion API: `../HallSensorBackend` (must be running for Simulate).

## Setup

```bash
cd HallSensorReact
cp .env.example .env   # optional; defaults to http://localhost:8000
npm ci
```

## Scripts

```bash
npm run dev        # http://localhost:5173
npm run build      # production → dist/
npm run preview    # serve dist/
npm run lint
npm run typecheck
npm test             # vitest (lib unit tests)
```

## Local full stack

1. Backend: `uvicorn app.main:app --reload --port 8000` in `HallSensorBackend`
2. `npm run dev` here
3. Open http://localhost:5173 — header should show **API Ready**

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `VITE_SIMULATION_API_URL` | `http://localhost:8000` | Backend origin (`/simulate`, `/sensor-packages`, `/health`) |

Optional runtime override (no rebuild): `window.__HALLSIM_API_URL__ = "https://…"`.

## Embed (ESM)

Built with `base: './'` and no History router — views are Zustand state only. After `npm run build`, import the hashed entry from `dist/assets/` (filename includes a content hash, e.g. `index-AbCdEfGh.js` — check `dist/index.html` for the exact name):

```js
import { mountHallSim } from "./assets/<built-entry>.js";
const { unmount } = mountHallSim(document.getElementById("hallsim-root"));
```

## Phase 1 coverage

Linear Sens(VDD), digital Bop/Brp, Chart 2/3, VDD UI, ah49f / ah1711 presets, custom setup, catalog, playback / gizmo / chart zoom, embed-safe ESM. NdFeB grades (Br from product appendix), multipole bar/ring, linear temp demag of Br. Magpylib evaluation disclaimer on landing, design panel, results, CSV, and PDF.

## Business-unit testing (hosted demo)

Self-guided test docs for reviewers with free access to the cloud demo:

- [docs/PHASE1_TESTER_GUIDE.md](docs/PHASE1_TESTER_GUIDE.md) — full walkthrough, test cases, limitations, feedback template  
- [docs/PHASE1_TEST_CHECKLIST.md](docs/PHASE1_TEST_CHECKLIST.md) — printable pass/fail checklist
