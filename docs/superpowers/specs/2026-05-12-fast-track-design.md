# Fast Track — Design Spec
**Date:** 2026-05-12
**Status:** Approved

---

## Overview

Fast Track is a cross-platform mobile workout timer app (iOS + Android) built with React Native (Expo Bare). It is designed for gym use: timing rest periods, tracking sets and reps, and keeping the most critical controls accessible at all times — including on the lock screen. The MVP is fully offline; cloud sync is a future subscription feature.

---

## 1. Tech Stack

| Concern | Choice |
|---|---|
| Framework | React Native — Expo Bare Workflow + TypeScript |
| Build & Deploy | EAS Build (iOS + Android store deployment) |
| State management | Zustand |
| Persistent data | SQLite via `expo-sqlite` |
| Preferences | MMKV via `react-native-mmkv` (sync, no async) |
| Navigation | React Navigation v6 (bottom tabs + stack) |
| Animations | Reanimated 3 (timer color transitions, overtime pulse) |
| Lock screen — iOS | `react-native-live-activities` (Live Activity + Dynamic Island) |
| Lock screen — Android | `@notifee/react-native` (foreground service notification) |
| Camera / images | `expo-camera` + `expo-image-picker` |
| Alerts | `expo-av` (ring) + `expo-haptics` (vibrate) |

**Project structure:** feature-based folders (`/timer`, `/exercises`, `/workout`, `/settings`, `/lockscreen`), each owning its screens, components, and local logic. Shared state in `/store`, DB layer in `/db`.

---

## 2. Visual Design

- **Theme:** Dark Performance — pure black background (`#0d0d0d`), neon green primary accent (`#00ff88`), white secondary text
- **Overtime state:** timer color flips from green → red (`#ff4444`), label shows `+MM:SS ↑`
- **Font:** tabular-nums for the timer display (no layout jitter as digits change)
- **Typography:** high-contrast, minimal UI — zero distraction during workouts

---

## 3. Data Model

### SQLite (persistent records)

```
Exercise
  id            UUID PK
  title         TEXT NOT NULL
  description   TEXT
  imageUri      TEXT            -- local file path
  defaultWeight REAL
  createdAt     INTEGER
  updatedAt     INTEGER

WorkoutPlan
  id            UUID PK
  name          TEXT NOT NULL
  createdAt     INTEGER
  updatedAt     INTEGER

PlanExercise                    -- ordered exercise slots inside a plan (the GOAL)
  id                UUID PK
  planId            UUID FK → WorkoutPlan
  exerciseId        UUID FK → Exercise  NULLABLE  (supports unnamed slots)
  order             INTEGER
  targetSets        INTEGER
  targetReps        INTEGER
  targetWeight      REAL
  targetRestDuration INTEGER    -- seconds

WorkoutSession
  id            UUID PK
  planId        UUID FK → WorkoutPlan  NULLABLE  (null if started without a plan)
  startedAt     INTEGER
  endedAt       INTEGER         -- null while active
  totalDuration INTEGER         -- seconds, written on session end

SessionExercise                 -- snapshot at session start; edits don't touch the library
  id                UUID PK
  sessionId         UUID FK → WorkoutSession
  exerciseId        UUID FK → Exercise  NULLABLE
  title             TEXT        -- denormalized snapshot (survives exercise deletion)
  order             INTEGER
  skipped           BOOLEAN DEFAULT 0
  targetSets        INTEGER
  targetReps        INTEGER
  targetWeight      REAL
  targetRestDuration INTEGER

SetLog                          -- one row per set attempt (the ACTUAL)
  id                    UUID PK
  sessionExerciseId     UUID FK → SessionExercise
  setNumber             INTEGER
  actualReps            INTEGER
  actualWeight          REAL
  actualRestDuration    INTEGER  -- seconds of rest actually taken
  completedAt           INTEGER
  skipped               BOOLEAN DEFAULT 0  -- true = user explicitly skipped this set
```

**Planned vs Actual:** `SessionExercise` holds the goal (copied from `PlanExercise` or set manually). `SetLog` holds what actually happened. A missing `SetLog` row for a planned set means the session ended before it was reached — distinct from `skipped = true`.

### MMKV (user preferences — sync reads)

```
timerDirection        'up' | 'down'          default: 'down'
alertType             'vibrate' | 'ring' | 'both'  default: 'vibrate'
defaultRestDuration   number (seconds)        default: 90
quickAdjustTimeStep1  number (seconds)        default: 5
quickAdjustTimeStep2  number (seconds)        default: 15
quickAdjustWeight     number (kg)             default: 5
quickAdjustSets       number                  default: 1
quickAdjustReps       number                  default: 1
storeWorkoutData      boolean                 default: true
```

---

## 4. Navigation Structure

```
App
├── Bottom Tabs
│   ├── Timer (default tab)
│   │   ├── WorkoutHomeScreen        -- no active session
│   │   └── ActiveWorkoutScreen      -- session in progress
│   │       └── ExerciseConfigModal  -- add / edit exercise mid-session
│   │
│   ├── Library
│   │   ├── LibraryHomeScreen        -- sub-tabs: Exercises | Workout Plans
│   │   ├── ExerciseDetailScreen
│   │   ├── CreateEditExerciseScreen
│   │   ├── WorkoutPlanDetailScreen
│   │   └── CreateEditWorkoutPlanScreen
│   │
│   └── Settings
│       └── SettingsScreen
│
└── Lock Screen (OS-level, outside React Navigation)
    ├── iOS: Live Activity + Dynamic Island
    └── Android: Foreground service notification
```

---

## 5. Core Features

### 5.1 Timer Engine

- Single background timer (`setInterval` + `AppState` listener for background persistence)
- **Modes:** countdown (default) or count-up, settable per session
- **Rest auto-start:** tapping "Next Set" logs the completed set then immediately starts the rest countdown
- **At zero:** alert fires (ring/vibrate per preference), timer color flips green → red, label switches to `+MM:SS` and continues counting up (overtime mode)
- **Overtime:** timer keeps running until user taps Pause, Reset, or Next Set
- **Quick-adjust:** `-step1`, `+step1`, `-step2`, `+step2` buttons work during active countdown and during overtime
- **Pause:** freezes timer; Resume continues from same value
- **Reset:** returns timer to `defaultRestDuration`

**Timer state machine:**
```
IDLE
  → RESTING         (tap "Next Set" or "Start Rest")
  → COUNTING_UP     (tap "Start Count" — for isometric exercises)

RESTING
  → OVERTIME        (reaches zero — color flip, continues counting up)
  → PAUSED          (tap Pause)

OVERTIME
  → OVERTIME        (tap "Stop Ring" — dismisses alert only, timer stays in OVERTIME)
  → PAUSED          (tap Pause)

PAUSED
  → RESTING         (tap Resume)

Any → IDLE          (tap Reset)
```

### 5.2 Active Workout Screen — Compact Split Layout

From top to bottom:
1. **Header strip:** workout elapsed time (left) — exercise name + target (right shortcut)
2. **Progress bars:** one pill per planned set, filled green as sets complete. For ad-hoc sessions with no target sets, pills are added dynamically as sets are logged (pills show completed sets only, no empty placeholders).
3. **Timer:** `MM:SS` large, state label below (`REST · SET 2 OF 4`)
4. **Time quick-adjust row:** `-15s  -5s  +5s  +15s` (values from preferences)
5. **Next Set button:** full-width primary CTA
6. **Weight / Sets / Reps panel:** three-column — `[-5kg] [80kg] [+5kg]` | `[-1set] [4] [+1set]` | `[-1rep] [8] [+1rep]`
7. **Secondary controls row:** Pause · Reset · Skip Set
8. **Bottom tabs**

**Skip Set vs Skip Exercise:**
- **Skip Set** (secondary controls row): marks the current set as `SetLog.skipped = true`, logs it, auto-advances to the next set's rest timer. Does not affect remaining sets.
- **Skip Exercise** (via ExerciseConfigModal long-press or swipe): marks `SessionExercise.skipped = true`, skips all remaining sets for that exercise and advances to the next exercise. All unlogged sets are treated as not reached (no `SetLog` row).

### 5.3 Workout Home Screen (no active session)

Three entry points:
- **Quick Start** — creates empty session, navigates to `ActiveWorkoutScreen`
- **Load Plan** — plan picker sheet, copies plan into session, starts
- **Add Exercise** — creates session with one exercise configured inline

### 5.4 Lock Screen UI (non-negotiable MVP)

Controls visible without unlocking the phone:
- **Stop Ring** — dismisses the alert sound/vibration
- **Restart Rest** — resets timer to `defaultRestDuration` and resumes
- **Start Count** — switches timer to count-up (isometric mode)
- **Next Set** — logs current set, starts rest for the next

Timer value updates every second. Tapping the widget opens the app to `ActiveWorkoutScreen`.

- **iOS:** Live Activity on lock screen + compact Dynamic Island view
- **Android:** Persistent foreground service notification with action buttons

---

## 6. Exercise Library

User-created exercises only (no pre-loaded library).

**Fields:**
- Title (required)
- Description (optional)
- Image (optional — pick from photo library or open camera)
- Default weight (optional, in kg)

**In a plan or session**, each exercise slot also has:
- Target sets, reps, weight, rest duration

---

## 7. Workout Plans (Templates)

- User creates named plans from their exercise library
- Exercises are ordered and each slot has a goal (sets, reps, weight, rest)
- Loading a plan into a session **copies** all data — edits during a session never affect the original plan
- Ad-hoc exercises (not in the library) can be added to a session directly

---

## 8. Settings

Grouped into sections on a single scrollable screen:

**Timer**
- Default direction: Count Down / Count Up
- Default rest duration
- Alert type: Vibrate / Ring / Both

**Quick-Adjust Shortcuts**
- Time step 1 (default 5s)
- Time step 2 (default 15s)
- Weight step (default 5kg)
- Set step (default 1)
- Rep step (default 1)

**Data & Privacy**
- Store workout data toggle (ON by default)
  - Toggling OFF prompts: "This will delete all stored workout data. Continue?"
  - When OFF: timer and exercises work fully; no writes to SQLite session tables
- Local storage used: `XX MB` (SQLite file size, shown live)

**About**
- App version, licenses

---

## 9. Data Storage & Privacy

- All data stored locally on device (SQLite + MMKV)
- No network requests in MVP
- User can disable workout data storage entirely — preferences (MMKV) are always kept
- Storage usage displayed in Settings so users stay informed
- Future: opt-in cloud sync via subscription (post-MVP)

---

## 10. Development Workflow

### Repository
- GitHub repo: `fast-track`
- `main` branch: protected, requires PR + review
- Feature branches: `feat/issue-{n}-{short-description}`
- Commit convention: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PRs linked to issues (`Closes #n`), auto-close on merge

### Epics (GitHub Milestones)

| # | Epic | Key deliverables |
|---|------|-----------------|
| 1 | Project Setup | Expo bare init, repo, CI, folder structure, linting |
| 2 | Data Layer | SQLite schema + migrations, MMKV setup, repository pattern |
| 3 | Exercise Library | CRUD exercises, image pick/camera |
| 4 | Workout Plans | CRUD plans, add/reorder/remove exercises |
| 5 | Timer Engine | Core logic, state machine, background persistence |
| 6 | Active Workout Screen | Full compact-split UI, all controls, set logging |
| 7 | Lock Screen | iOS Live Activity + Android foreground notification |
| 8 | Settings | All preferences, data toggle, storage usage display |
| 9 | Workout Session Flow | Home entry points, session lifecycle, end-of-session summary |
| 10 | Polish & Store Prep | App icon, splash, onboarding, EAS build config, store assets |

### Post-MVP (v1.1+)
- Dashboard: workout history, per-exercise planned-vs-actual comparisons
- Cloud sync via subscription

---

## 11. MVP Scope Boundary

**In MVP:**
- Timer (count up/down, overtime, auto-start with override)
- Exercise library (user-created)
- Workout plans (templates, copy-on-load)
- Active workout session (flexible: empty, plan-based, or ad-hoc)
- Set logging (actual vs goal)
- Lock screen controls (iOS + Android)
- Settings & preferences
- Local storage with privacy toggle

**Out of MVP (v1.1+):**
- Dashboard / analytics
- Cloud sync / subscription
- Pre-loaded exercise library
- Social or sharing features
