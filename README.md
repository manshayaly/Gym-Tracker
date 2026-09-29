# Gym Tracker

An iPhone app for logging gym workouts and seeing whether you're getting
stronger — built entirely with **Claude Code** by someone with **no coding
experience**.

> Final project for the Meska AI program. A walkthrough video accompanies this
> repository.

## The problem

In the gym, progress depends on one thing: doing a little more than last time
(*progressive overload*). But mid-workout it's hard to remember what you lifted
last session, so most people guess — or scroll through messy notes between sets.
Without a record you can't see whether you're actually getting stronger.

## The solution

A focused workout log that shows **what you did last time, right where you log
the next set**:

- **Home** — the app's logo, today's date and one button: *Let's train*,
  *Continue*, or *Workout complete* once you end your session.
- **Today's workout** — add exercises from a searchable list, log weight × reps
  in one tap per set, see **last time** on every exercise, and **End workout**
  when you're done.
- **Exercise library** — 176 common exercises, searchable and filterable by
  muscle group and equipment, each with your **all-time personal best**.
- **History** — every workout, grouped by month, with the full breakdown of
  exercises and sets.
- **Bodyweight** — daily weigh-ins with the change from the last one and a
  **trend chart** that smooths out day-to-day water/food swings.

Everything is stored on the phone; no account or internet connection needed.

## How I built it with Claude

I have no programming background. I built the whole app by describing what I
wanted to **Claude Code** (Anthropic's AI coding assistant) in plain language,
using a disciplined, step-by-step process:

1. **Project brief first.** I wrote down the goal, the MVP scope, and the rules
   (e.g. "store weights in kg, allow a lb display later") in
   [`CLAUDE.md`](CLAUDE.md), which Claude reads at the start of every session.
2. **Plan → approve → build.** For every feature Claude first explained the
   plan in plain terms — what I'd see, the decisions involved, and the trade-offs —
   and only started coding after I approved it. I changed my mind several times
   (e.g. dropping per-exercise charts in favour of a simple personal-best card),
   and Claude adapted the plan.
3. **Small, tested steps.** Each feature was split into small pieces. Claude
   tested each piece automatically on the Mac (database logic, date handling,
   edge cases) and then gave me a short checklist to test on my phone. Only
   after I confirmed did it save the step to git — **23 saved versions** in this
   repository's history.
4. **Design from a style guide.** I gave Claude a design system file
   ([`DESIGN.md`](DESIGN.md)); it adapted the web guide to an iPhone app
   (colors, typography, square corners) and drew an original logo, offering me
   three options to choose from.
5. **Problem-solving along the way.** Claude handled things I wouldn't have
   known how to fix: failed installs on a slow connection, a database upgrade
   system that keeps my data safe as the app evolves, and running the app on my
   phone away from home.

## Tech overview

For reviewers who want the details:

| | |
|---|---|
| Framework | Expo SDK 57 (React Native 0.86) + TypeScript |
| Navigation | Expo Router with native iOS tabs |
| Storage | SQLite on the device (`expo-sqlite`) with versioned migrations |
| Chart | `victory-native` (Skia) |
| Code | ~3,000 lines in [`src/`](src) |

Data model highlights, designed so cloud sync could be added later: every
record has a UUID and `updated_at` timestamp, deletions are soft (`deleted_at`),
and all weights are stored in kilograms.

## Running it

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on an iPhone.
