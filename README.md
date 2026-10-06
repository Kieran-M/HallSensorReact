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
npm run build     # production bundle -> dist/
npm run preview   # serve dist/
npm run lint      # ESLint
```

Typecheck (project references):

```bash
npx tsc --noEmit -p tsconfig.app.json
```

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `VITE_SIMULATION_API_URL` | `http://localhost:8000` | Backend origin for `/simulate` |

## Local full stack

1. Start the backend (`uvicorn app.main:app --reload --port 8000` in `HallSensorBackend`)
2. `npm run dev` in this repo
3. Open http://localhost:5173
