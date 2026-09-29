# Gym Tracker

## What this app is
An iOS app for logging gym workouts and tracking strength progress over time.
The core loop: pick an exercise → log weight and reps → see if you're getting
stronger over weeks/months. Personal project for now, may become a real
product later — so keep the data model clean even though there's no backend yet.

## MVP scope (build only this first)
1. **Exercise library**: searchable list of ~150-200 common exercises, each
   tagged with a muscle group (chest, back, legs, shoulders, arms, core) and
   equipment (barbell, dumbbell, cable, machine, bodyweight). Seed this data
   once, store it locally.
2. **Logging a set**: user searches/browses to an exercise, enters weight and
   reps, saves it as part of today's workout. Show their last performance on
   that exact exercise right on the entry screen (this is what drives
   progressive overload).
3. **Workout history**: list of past workouts, each showing exercises/sets done.
4. **Personal best**: when an exercise is opened, show its all-time best set
   (heaviest weight; ties → most reps; 0 kg bodyweight-only → most reps).
   No Progress tab, per-exercise charts, or PR badges — the user decided
   these aren't needed.
5. **Bodyweight log**: simple date + weight entries, one per day (saving
   again the same day replaces it), today only, list with change from the
   previous entry, and a line chart of daily weights with a smoothed trend
   line (press and drag to read a day's value).

Explicitly NOT in MVP: user accounts, cloud sync, social features, custom
routines/programs, rest timers, progress photos.

## Data model
- Data lives locally on-device (SQLite via expo-sqlite), no backend yet.
- Every record gets a UUID and an `updated_at` timestamp, even though we don't
  sync yet — this makes adding sync later much less painful.
- Core entities: Exercise (id, name, muscle_group, equipment), Workout (id,
  date), WorkoutSet (id, workout_id, exercise_id, weight, reps, set_number),
  BodyweightEntry (id, date, weight).
- **Units:** all weights (lifted and bodyweight) are stored in **kg**, always.
  Converting to lb is purely a display concern — a future settings toggle
  will convert at the screen level. Never store a unit alongside a weight or
  store lb values; keep conversion in one shared helper.
- **Deletes are soft:** user-deletable tables have a nullable `deleted_at`
  timestamp. Deleting sets it (and bumps `updated_at`); every read query
  filters `deleted_at IS NULL`. Rows are never physically removed, so a future
  sync can propagate deletions.
- **Dates vs timestamps:** calendar days (e.g. a workout's date) are the
  phone's *local* date as `YYYY-MM-DD`; `created_at`/`updated_at`/`deleted_at`
  are UTC ISO 8601 timestamps. Never derive a local date from `toISOString()`.
- **One workout per local calendar day**, created automatically when the
  first set of the day is saved.

## Stack
- Expo (React Native) + TypeScript, Expo Router for navigation.
- expo-sqlite for local storage.
- victory-native (Skia-based, works in Expo Go) for the bodyweight chart —
  the only chart in the MVP; exercises deliberately have no charts.

## How we work
- Plan before building: for any new feature, outline the approach first,
  I'll approve it, then build.
- Build one small piece at a time. After each working piece, commit it with git.
- I have zero coding experience — explain what you're doing in plain terms,
  and flag anything I need to test manually on my phone.

@AGENTS.md
