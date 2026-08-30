# Handback

## Existing App Review

The Claude-built Swing Gains PWA had useful foundations: Vite/React PWA setup, local-first Dexie storage, workout logging, progress views, and tests around queue/progression behaviour. Its main mismatch for this brief was product shape: it was built around gym/home blocks, ladders, video-link merge tooling, CSV tracker exports, and multi-device transfer. That made the next action less obvious for a simple three-day resistance-band programme.

## New Build

This repo is a separate Codex-built app. It keeps the reusable architecture ideas, but rebuilds the product around:

- Workout A: strength and stability.
- Workout B: controlled HIIT and mobility.
- Workout C: strength, rotation and golf power.
- 8-week phases: Foundation, Build, Performance.
- Local session history, set logging, reps/seconds, band level and RPE.
- Progress recommendations based on recent clean top-range hits, misses and high-RPE work.
- PWA packaging with a separate browser database name.

## Tests

- `npm test` passed: 5 tests.
- `npm run build` passed and generated the production PWA bundle.
- Local dev server checked at `http://127.0.0.1:5173/` with HTTP 200.

## Remaining Issues

- No cloud sync or import flow yet.
- Exercise demonstrations are text-only; no video library has been curated for the new band-only plan.
- Band tension is tracked by named level, not measured force, so progression is deliberately practical rather than exact.

## Load-Bearing Assumption

The user has no current injury or movement restriction requiring clinical modification of the programme.
