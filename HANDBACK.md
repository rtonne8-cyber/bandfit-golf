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
- Same surface depth as the Claude app: Next Up, Session Runner, Programme, Progress, Metrics, Exercise Detail, and Settings/Data.
- Editable per-exercise video links, richer cues/setup/safety/substitution content, and a rest timer.

## Tests

- `npm test` passed: 7 tests.
- `npm run build` passed and generated the production PWA bundle.
- Local dev server checked at `http://127.0.0.1:5173/` with HTTP 200.

## Remaining Issues

- No cloud sync yet.
- Exercise demonstrations support editable URLs, but no curated video library has been populated for the new band-only plan.
- Band tension is tracked by named level, not measured force, so progression is deliberately practical rather than exact.

## iPad Recommendation

The original Swing Gains app used GitHub Pages from a public repo. BandFit Golf now has the same workflow and PWA base-path setup, but GitHub Pages is blocked while this repo remains private on the current GitHub plan. The two practical paths are: make `bandfit-golf` public and use `https://rtonne8-cyber.github.io/bandfit-golf/`, or keep the repo private and deploy the app through another HTTPS host.

iPad installation should be done from Safari using Share -> Add to Home Screen.

## Load-Bearing Assumption

The user has no current injury or movement restriction requiring clinical modification of the programme.
