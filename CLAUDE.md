# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make dev        # Vite dev server (localhost:5173)
make build      # Production build → dist/
make test       # Run tests (vitest run — no watch)
make lint       # oxlint
make check      # lint + test
make preview    # build then vite preview
```

Run a single test file:
```bash
npx vitest run src/engine/matchup.test.js
```

## Architecture

Browser-only, no backend. Three game phases managed in `App.jsx` via `gamePhase` state: `team_select → drive → result`.

**Data flow:**
- `App.jsx` owns all top-level state: `gamePhase`, `offenseTeam`, `defenseTeam`, and the drive state via `useReducer(driveReducer, initialDriveState)`
- `drive.result` transitioning from `null` triggers phase change to `"result"` via `useEffect`
- `RESET` action returns to `initialDriveState`; `CALL_PLAY` payload is `{ play, offenseTeam, defenseTeam }`

**Engine (`src/engine/`):**
- `matchup.js` — pure `resolvePlay(play, offenseTeam, defenseTeam) → { yardsGained, event }`. Computes offense/defense score averages from the keys listed in the play config, applies ±5 yard advantage modifier, rolls sack check scaled by `defenseTeam.defense.passRush`.
- `drive.js` — pure reducer. Field position starts at 25; touchdown at ≥ 100. Play log entries are snapshotted *before* resolution (captures down/yardsToGo at snap).

**Config (`src/config/`):**
- `teams.js` — 15 teams. Shape: `{ id, year, city, name, offense: { runAttack, passAttack, olStrength, skillPlayers }, defense: { runStop, passCoverage, passRush, secondary } }`
- `plays.js` — 6 plays. Shape: `{ id, name, type, description, offenseKeys, defenseKeys, baseYards: { min, max }, sackRisk }`. `offenseKeys`/`defenseKeys` reference the rating key names on team objects. Adding a team or play only requires appending to the config array.

**UI components (`src/components/`):**
- `TeamSelector.jsx` — player picks offense; defense randomly assigned (enforced different). Calls `onStart(offense, defense)`.
- `FieldView.jsx` — stateless SVG renderer. Derives formation (4-3, 3-4, Nickel, Dime) from the highest of the defense's four ratings. Dot opacity scales with rating value.
- `PlayPicker.jsx` — randomly selects 3 plays each down, dispatches `CALL_PLAY`, disables cards after selection.
- `DriveResult.jsx` — play-by-play log table; "Play Again" calls `onPlayAgain()` which dispatches `RESET` and returns to `team_select`.

## Tech Stack

React 19 + Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no `tailwind.config.js`), oxlint, vitest.

## Implementation Stories

The README contains the full story backlog (Epics 1–4). Use the `implement-story` skill when working on a story: it handles branching, extracts the relevant story section, and drives implementation. Commit messages reference the story: `feat: story N.N — description`.
