# BandFit Golf

BandFit Golf is a small offline-first PWA for an 8-week, 3-day-per-week golfer training plan using only resistance bands, a door anchor and bodyweight exercises.

## Programme

- Workout A: strength and stability
- Workout B: controlled full-body HIIT and mobility
- Workout C: strength, rotation and golf power

The app tracks completed sessions, current week, phase, sets, reps or seconds, band level and RPE. Progression recommendations are generated from logged training history.

## Screens

- Next Up: current week, phase, next session and weekly A/B/C status.
- Session Runner: touch-friendly set logging, band level, RPE and rest timer.
- Programme: phase map and full prescriptions for all three weekly workouts.
- Progress: frequency, band-progression signals, swing speed and ROM trends.
- Metrics: swing speed, ROM self-tests and bodyweight quick entry.
- Exercise Detail: description, cues, setup, substitutions, safety and editable video URL.
- Settings / Data: local backup export/import, units, iPad install note and safety boundary.

## iPad path

The best route is to keep this private repo as the source of truth, polish/test locally, then deploy a stable PWA URL. Once deployed, open the URL in Safari on iPad and use Share -> Add to Home Screen.

## Development

```bash
npm install
npm run dev
npm test
npm run build
```

## Origin

This project was rebuilt in Codex as a new application. The earlier Claude-built Swing Gains PWA was used only as a read-only architecture and UX reference.
