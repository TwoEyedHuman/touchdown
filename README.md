# 🏈 Touchdown
> Browser-based NFL drive strategy game — pick plays, read defenses, score touchdowns.

**Live:** [touchdown.brandonlocke.xyz](https://touchdown.brandonlocke.xyz)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Repository Structure](#repository-structure)
3. [Technology Stack](#technology-stack)
4. [Environment Strategy](#environment-strategy)
5. [Pre-Flight Checklist](#pre-flight-checklist)
6. [Implementation Stories](#implementation-stories)
7. [Secrets & Config Management](#secrets--config-management)
8. [Definition of Done](#definition-of-done)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React)                  │
│                                                     │
│  ┌─────────────┐   ┌──────────┐   ┌─────────────┐  │
│  │TeamSelector │──▶│FieldView │──▶│ PlayPicker  │  │
│  └─────────────┘   └──────────┘   └──────┬──────┘  │
│                                          │          │
│                                   ┌──────▼──────┐   │
│                                   │  matchup.js │   │
│                                   │  drive.js   │   │
│                                   └──────┬──────┘   │
│                                          │          │
│                                   ┌──────▼──────┐   │
│                                   │DriveResult  │   │
│                                   └─────────────┘   │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  src/config/teams.js   src/config/plays.js   │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │  Fly.io (static)  │
              │  Docker + nginx   │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │  Namecheap DNS    │
              │  CNAME → fly.dev  │
              └───────────────────┘
```

### Key Design Decisions
- **Config-driven teams and plays:** All team ratings and play definitions live in flat JS config files. Adding content never requires touching engine or UI code.
- **No backend:** The matchup engine runs entirely in the browser. No API, no database, no auth — just a static build served from Fly.io.
- **SVG field view:** Defensive formations are rendered as inline SVG, keeping the bundle lean and the renderer fully controllable without a canvas or third-party charting library.
- **Extensibility mechanism:** To add a new team or play, append one object to `src/config/teams.js` or `src/config/plays.js` respectively. The engine and UI pick it up automatically.

---

## Repository Structure

```
touchdown/
├── README.md
├── Dockerfile
├── fly.toml                        ← Fly.io app config
├── nginx.conf                      ← Static file server config
├── .env.example                    ← Committed; .env is gitignored
│
└── src/
    ├── config/
    │   ├── teams.js                ← Team ratings (add teams here)
    │   └── plays.js                ← Play definitions (add plays here)
    ├── engine/
    │   ├── matchup.js              ← Yards/sack resolution logic
    │   └── drive.js                ← Down, distance, field position state
    ├── components/
    │   ├── TeamSelector.jsx        ← Offense/defense matchup display
    │   ├── FieldView.jsx           ← SVG defensive formation renderer
    │   ├── PlayPicker.jsx          ← 3-play choice UI
    │   └── DriveResult.jsx         ← Post-drive summary screen
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, minimal config, static build output |
| Styling | Tailwind CSS | Utility-first, no stylesheet to maintain |
| Field Renderer | Inline SVG | No canvas API, fully styleable, no dependencies |
| State | React `useReducer` | Drive state has clear actions; no need for external lib |
| Containerization | Docker + nginx | Serves static build; consistent local and prod behavior |
| Hosting | Fly.io | Docker-native deploy, automatic TLS, predictable billing |
| DNS | Namecheap | CNAME `touchdown` → Fly.io app hostname |

---

## Environment Strategy

| | Local Dev | Production |
|---|---|---|
| Domain | `localhost:5173` | `touchdown.brandonlocke.xyz` |
| TLS | None | Fly.io automatic (Let's Encrypt) |
| Secrets | N/A (no secrets needed) | N/A |
| Deploy | `npm run dev` | `fly deploy` |
| Server | Vite dev server | nginx in Docker on Fly.io |

---

## Pre-Flight Checklist

Run before first build and after any environment change:

```bash
# Node is installed (18+ required)
node -v && echo "✓ Node ok" || echo "✗ Node not found"

# Dependencies are installed
test -d node_modules && echo "✓ node_modules found" || echo "✗ run npm install"

# Vite dev server starts cleanly
npm run dev -- --port 5173 &
sleep 3 && curl -s http://localhost:5173 | grep -q "html" && echo "✓ Dev server ok" || echo "✗ Dev server failed"
kill %1

# Production build succeeds
npm run build && echo "✓ Build ok" || echo "✗ Build failed"

# Docker is available (for prod parity)
docker info > /dev/null && echo "✓ Docker running" || echo "✗ Docker not running"

# Fly CLI is authenticated
fly auth whoami && echo "✓ Fly.io authenticated" || echo "✗ Run: fly auth login"
```

---

## Implementation Stories

### Epic 1 — Project Scaffold & Config

#### Story 1.1 — Vite + React + Tailwind scaffold
**Context:** No project exists yet. This story creates the base repo everything else builds on.

**Assumptions:**
- Node 18+ is installed
- `npm` is available

**Tasks:**
- Run `npm create vite@latest touchdown -- --template react` and install dependencies
- Install and configure Tailwind CSS per Vite guide
- Delete boilerplate (`App.css`, `assets/react.svg`, default `App.jsx` content)
- Create `src/config/teams.js` with the full starter set of 15 teams (ratings defined below in Story 1.2)
- Create `src/config/plays.js` with the initial 6 play definitions (defined in Story 1.3)
- Confirm `npm run dev` starts with no errors and renders a blank page

**Out of Scope:** Any game UI, engine logic, or Docker setup.

**Acceptance Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces a `dist/` folder
- [ ] `src/config/teams.js` and `src/config/plays.js` exist and export arrays
- [ ] Tailwind utility classes render correctly on a test element

---

#### Story 1.2 — Team config population
**Context:** `src/config/teams.js` exists as an empty export from Story 1.1. This story fills it with all starter teams and documents the schema.

**Assumptions:**
- Story 1.1 is complete
- Team shape: `{ id, year, city, name, offense: { runAttack, passAttack, olStrength, skillPlayers }, defense: { runStop, passCoverage, passRush, secondary } }`

**Tasks:**
- Populate `teams.js` with all 15 starter teams with tuned ratings (1–99):

| Team | Year |
|------|------|
| New England Patriots | 2007 |
| Baltimore Ravens | 2000 |
| Seattle Seahawks | 2013 |
| Chicago Bears | 1985 |
| St. Louis Rams | 1999 |
| Kansas City Chiefs | 2018 |
| Miami Dolphins | 1972 |
| Denver Broncos | 2015 |
| San Francisco 49ers | 2019 |
| Philadelphia Eagles | 2017 |
| Baltimore Ravens | 2012 |
| New Orleans Saints | 2009 |
| Pittsburgh Steelers | 1978 |
| Atlanta Falcons | 2016 |
| Philadelphia Eagles | 2022 |

- Add a JSDoc comment block above the array documenting the schema
- Verify the export is a valid JS array with no duplicate IDs

**Out of Scope:** UI display of teams, engine usage of ratings.

**Acceptance Criteria:**
- [ ] `teams.js` exports an array of exactly 15 objects
- [ ] All objects have all 8 rating keys with values between 1 and 99
- [ ] No duplicate `id` values
- [ ] `import teams from './config/teams'` works in a scratch component without error

---

#### Story 1.3 — Play config population
**Context:** `src/config/plays.js` exists as an empty export from Story 1.1. This story defines the initial play set.

**Assumptions:**
- Story 1.1 is complete
- Play shape: `{ id, name, type, description, offenseKeys, defenseKeys, baseYards: { min, max }, sackRisk }`

**Tasks:**
- Populate `plays.js` with these 6 plays:

| Name | Type | offenseKeys | defenseKeys | Base Yards | sackRisk |
|------|------|-------------|-------------|------------|---------|
| HB Dive | run | runAttack, olStrength | runStop | -2 to 6 | 0 |
| HB Draw | run | runAttack, olStrength | runStop | -1 to 8 | 0 |
| Screen Pass | pass | skillPlayers | runStop | 0 to 10 | 0.05 |
| Short Pass | pass | passAttack, skillPlayers | passCoverage | -2 to 12 | 0.1 |
| Play Action | pass | passAttack, olStrength | passRush | 2 to 18 | 0.15 |
| Deep Pass | pass | passAttack | secondary, passRush | -5 to 30 | 0.25 |

- Add a JSDoc comment block above the array documenting the schema
- `sackRisk` is a float 0–1; run plays must be `0`

**Out of Scope:** Engine logic, UI display.

**Acceptance Criteria:**
- [ ] `plays.js` exports an array of exactly 6 objects
- [ ] All run plays have `sackRisk: 0`
- [ ] All `offenseKeys` and `defenseKeys` values are valid keys on the team rating objects from Story 1.2
- [ ] `import plays from './config/plays'` works without error

---

### Epic 2 — Game Engine

#### Story 2.1 — Matchup resolution engine
**Context:** Config files exist from Epic 1. This story builds the pure function that resolves a play call into yards gained.

**Assumptions:**
- Stories 1.2 and 1.3 are complete
- No UI involvement — this is pure logic only

**Tasks:**
- Create `src/engine/matchup.js` exporting a single function: `resolvePlay(play, offenseTeam, defenseTeam) → { yardsGained, event }`
- `event` is one of: `null`, `"sack"`, `"tackle_for_loss"`
- Implement the resolution algorithm:
  1. Compute `offenseScore` = average of `play.offenseKeys` ratings from `offenseTeam`
  2. Compute `defenseScore` = average of `play.defenseKeys` ratings from `defenseTeam`
  3. `advantage = (offenseScore - defenseScore) / 99` → scale to a ±5 yard modifier
  4. Draw `baseYards` = random int in `play.baseYards` range
  5. `finalYards = baseYards + advantageModifier` (round to int)
  6. If `play.sackRisk > 0`: roll for sack using `defenseTeam.defense.passRush` — high passRush increases sack probability; sack = -3 to -7 yards, event = `"sack"`
  7. If `finalYards < 0` and not a sack and play type is `"run"`: event = `"tackle_for_loss"`
- Write unit tests covering: big offense advantage, big defense advantage, sack scenario, run tackle for loss

**Out of Scope:** Drive state, UI, down/distance logic.

**Acceptance Criteria:**
- [ ] `resolvePlay` returns `{ yardsGained, event }` for all 6 play types
- [ ] Sacks only occur on pass plays
- [ ] Tackle for loss only occurs on run plays
- [ ] Running the function 1000 times produces no NaN or undefined results
- [ ] Unit tests pass with `npm test`

---

#### Story 2.2 — Drive state machine
**Context:** `matchup.js` exists from Story 2.1. This story builds the drive state reducer that tracks down, distance, and field position.

**Assumptions:**
- Story 2.1 is complete
- Drive starts at own 25-yard line (field position 25); end zone is at 100

**Tasks:**
- Create `src/engine/drive.js` exporting:
  - `initialDriveState` — starting state object
  - `driveReducer(state, action)` — pure reducer
- State shape: `{ down, yardsToGo, fieldPosition, plays, result }`
  - `plays`: array of `{ playName, yardsGained, event, down, yardsToGo }` (logged before resolution)
  - `result`: `null | "touchdown" | "turnover_on_downs"`
- Actions: `CALL_PLAY` (payload: `{ play, offenseTeam, defenseTeam }`)
- On `CALL_PLAY`:
  - Call `resolvePlay` to get yards
  - Advance `fieldPosition`
  - If `fieldPosition >= 100`: result = `"touchdown"`
  - If `yardsToGo` met: reset to 1st and 10
  - If 4th down failed: result = `"turnover_on_downs"`
  - Otherwise: increment down, update `yardsToGo`
  - Append to `plays` log
- Write unit tests: touchdown drive, turnover on downs, first down reset

**Out of Scope:** Play selection UI, formation display.

**Acceptance Criteria:**
- [ ] `driveReducer` is a pure function (no side effects)
- [ ] Touchdown triggers when `fieldPosition >= 100`
- [ ] Turnover on downs triggers correctly on 4th down failure
- [ ] First down resets down to 1 and yardsToGo to 10
- [ ] Unit tests pass with `npm test`

---

### Epic 3 — UI Components

#### Story 3.1 — Team Selector screen
**Context:** Engine is complete from Epic 2. This story builds the opening screen where the player sees their offense and the opposing defense.

**Assumptions:**
- Stories 2.1 and 2.2 are complete
- `teams.js` is populated
- Offense team is selected by the player; defense team is randomly assigned

**Tasks:**
- Create `src/components/TeamSelector.jsx`
- Display a dropdown or card grid for the player to pick their offense team
- On selection, randomly assign a defense team (different from the chosen offense)
- Display both teams with: city, name, year, and a visual rating bar for each of the 4 offense/defense stats
- "Start Drive" button advances to the game screen
- Pass selected `offenseTeam` and `defenseTeam` up to `App.jsx` via props/callback

**Out of Scope:** Field view, play picker, drive logic.

**Acceptance Criteria:**
- [ ] All 15 teams appear in the offense selector
- [ ] Defense team is always different from the selected offense
- [ ] Rating bars render for all 8 stats across both teams
- [ ] "Start Drive" is disabled until an offense is selected
- [ ] Renders correctly on mobile (375px) and desktop (1280px)

---

#### Story 3.2 — Field View (defensive formation SVG)
**Context:** Team selection works from Story 3.1. This story renders the defensive formation on an SVG field before each play.

**Assumptions:**
- Story 3.1 is complete
- Defense team object is available as a prop
- Four formations: 4-3, 3-4, Nickel, Dime

**Tasks:**
- Create `src/components/FieldView.jsx`
- Derive formation from `defenseTeam` ratings:
  - Highest of `{ runStop → 4-3, passRush → 3-4, passCoverage → Nickel, secondary → Dime }`
- Define static x/y positions for each formation's defender dots (11 defenders)
- Render each defender as an SVG circle with a short label (e.g. "MLB", "CB", "S")
- Dot fill opacity scales with the relevant rating (higher rating = more opaque/intense)
- Display formation name as a label on the field
- Component is stateless — re-renders whenever `defenseTeam` prop changes

**Out of Scope:** Play picker, animation, interactivity.

**Acceptance Criteria:**
- [ ] All 4 formations render without SVG errors
- [ ] Defender dot intensity visually reflects rating strength
- [ ] Formation label is correct for each defensive team
- [ ] SVG scales correctly at mobile and desktop widths

---

#### Story 3.3 — Play Picker
**Context:** Field view exists from Story 3.2. This story renders the 3-play choice UI and wires it to the drive reducer.

**Assumptions:**
- Stories 2.2 and 3.2 are complete
- `plays.js` is populated with 6 plays
- Drive state and dispatch are passed down from `App.jsx`

**Tasks:**
- Create `src/components/PlayPicker.jsx`
- On each render, randomly select 3 plays from `plays.js` (no duplicates)
- Display each play as a card: name, type badge, short description
- On click: dispatch `CALL_PLAY` with the selected play and both teams
- Display result of the previous play (yards gained, event label) above the cards
- Show current down, yards to go, and field position at the top
- Disable all cards once a play is selected (until next down renders)
- When `drive.result` is not null, do not render play cards — let `App.jsx` transition to result screen

**Out of Scope:** Result screen, formation re-render logic (handled by FieldView).

**Acceptance Criteria:**
- [ ] Exactly 3 unique plays are shown each down
- [ ] Clicking a play dispatches correctly and updates drive state
- [ ] Down/distance/field position updates after each play
- [ ] Cards are disabled after selection until next down
- [ ] Previous play result is shown with correct yardage and event label

---

#### Story 3.4 — Drive Result screen
**Context:** Full drive flow works from Story 3.3. This story builds the post-drive summary.

**Assumptions:**
- Story 3.3 is complete
- `drive.result` is `"touchdown"` or `"turnover_on_downs"`
- `drive.plays` contains the full play log

**Tasks:**
- Create `src/components/DriveResult.jsx`
- Display result header: "Touchdown! 🏈" or "Turnover on Downs"
- Show total play count
- Render a play-by-play log table: play name, yards gained, event (sack/TFL if applicable), down and distance at snap
- "Play Again" button resets drive state and returns to `TeamSelector`
- Style touchdown result distinctly from turnover on downs (color, icon)

**Out of Scope:** Sound effects, animation, persistent score tracking.

**Acceptance Criteria:**
- [ ] Touchdown and turnover states render with distinct styling
- [ ] Play log shows every play in order with correct yardage
- [ ] "Play Again" resets all state and returns to team selection
- [ ] Renders correctly on mobile and desktop

---

### Epic 4 — Integration & Polish

#### Story 4.1 — App.jsx wiring and game flow
**Context:** All components and engine exist from Epics 2 and 3. This story wires everything together into a cohesive game flow.

**Assumptions:**
- All Epic 2 and Epic 3 stories are complete
- Game has three screens: `team_select`, `drive`, `result`

**Tasks:**
- Implement `App.jsx` with a `gamePhase` state: `"team_select" | "drive" | "result"`
- Wire `TeamSelector` → sets offense/defense teams, advances to `"drive"`
- In `"drive"` phase: render `FieldView` and `PlayPicker` side by side (or stacked on mobile)
- When `drive.result` is set: advance `gamePhase` to `"result"`
- In `"result"` phase: render `DriveResult`; "Play Again" returns to `"team_select"` and resets drive state
- Initialize `driveReducer` with `useReducer` in `App.jsx` and pass dispatch/state to children

**Out of Scope:** Persistent history, sound, animations.

**Acceptance Criteria:**
- [ ] Full game loop works end-to-end: select teams → play drive → see result → play again
- [ ] Drive state resets cleanly on "Play Again"
- [ ] No stale state bleeds between games
- [ ] Layout is usable on both mobile (375px) and desktop (1280px)

---

#### Story 4.2 — Dockerfile and Fly.io deploy
**Context:** App builds cleanly from Story 4.1. This story containerizes it and deploys to production.

**Assumptions:**
- `npm run build` produces a clean `dist/` folder
- Docker is installed locally
- Fly CLI is installed and authenticated (`fly auth login`)
- Domain `touchdown.brandonlocke.xyz` is managed in Namecheap

**Tasks:**
- Create `Dockerfile` using multi-stage build: Node 18 build stage → nginx alpine serve stage
- Create `nginx.conf` configured to serve `dist/` as a SPA (all routes → `index.html`)
- Create `fly.toml` with app name, region, and HTTP service config
- Run `fly launch` to provision the app on Fly.io
- Add custom domain: `fly certs add touchdown.brandonlocke.xyz`
- In Namecheap: add `CNAME` record `touchdown` → `<app>.fly.dev`
- Verify TLS is provisioned: `fly certs show touchdown.brandonlocke.xyz`
- Confirm live URL loads the game

**Out of Scope:** CI/CD pipeline, staging environment.

**Acceptance Criteria:**
- [ ] `docker build` succeeds locally
- [ ] `docker run -p 8080:80` serves the app at `localhost:8080`
- [ ] `fly deploy` completes without errors
- [ ] `https://touchdown.brandonlocke.xyz` loads the game in a browser
- [ ] TLS certificate is valid (no browser warnings)
- [ ] `fly status` shows app as running

---

## Secrets & Config Management

This project has no secrets — it is a fully static, client-side application with no API keys, tokens, or environment-specific configuration required.

Config that may vary (e.g. future API integrations) should follow this pattern:
- Add to `.env.example` with a placeholder value
- Reference via `import.meta.env.VITE_*` in source
- Never commit `.env`

---

## Definition of Done

A story is done when:
- [ ] All acceptance criteria are checked off
- [ ] `npm run build` passes with no errors or warnings
- [ ] The feature works on Chrome (desktop) and Safari (mobile)
- [ ] No `console.error` output during normal gameplay
- [ ] Code is committed with a descriptive message referencing the story (e.g. `feat: story 2.1 — matchup resolution engine`)
