# Latest Change — Visit History Phase 4

Date: 2026-09-19

## Product decision

Visit History Phase 2 is complete. Phase 3 unvisited-aware / visited-excluded random modes are intentionally skipped.

Random selection remains independent from visit history. If a previously visited station is drawn again, the user decides whether to keep it or use the existing redraw action.

## Phase 4 entry

The main `발자취` section now exposes two sibling actions:

- `발자취 노선도 보기`
- `방문 통계`

Statistics are a separate screen; opening the footprint map is not required first.

## Statistics contract

All statistics are derived read-only from durable `VisitRecord` data. No new statistics storage key or visit-schema migration was added.

Displayed metrics:

- unique visited physical stations / all physical stations + progress percentage
- per-line visited station counts and percentages
- total durable visit records
- latest user-entered visit date + undated record count
- confirmed food/alcohol unique categories + confirmation count
- confirmed attraction unique places + revisit-inclusive count
- confirmed attraction prominence breakdown: Diamond / Gold / Silver / Standard, each with unique-place count and revisit-inclusive count

Only user-confirmed food and attraction choices count. Merely shown draw candidates do not.

## Interchange rule

Overall coverage counts one physical interchange once.

Per-line progress credits that visited physical station to **every line that belongs to the interchange**, regardless of which line produced the original draw.

Example: a visit saved from **1호선 신도림** counts:

- overall physical-station progress: 1 visited station
- 1호선 progress: 신도림 +1
- 2호선 progress: 신도림 +1

Revisiting 신도림 does not add another station to either line's coverage.

The same canonical station-equivalence rules as the footprint map are reused: 신촌/양평 same-name non-interchanges stay separate and 총신대입구(이수) ↔ 이수 stays unified.

## Verification

Web:
- Phase 4 PR #16 CI `35367289293` — success
- main merge `e15b8b6108d6c3664174a53f3a3e918a44a5276f`
- main CI `35367506018` — success
- Web Release `35367506047` — success
- deployment commit `e92f0e22d33661363dde31c4c88aec904975484c`
- deployed bundle `assets/modular-Ct4Elvwv.js`

Android:
- branch `feature/random-seoul-android`
- Phase 4 synced head `a5a9b78bf83c1929f32de521b53d4a28771d5539`
- Android CI `35367476033` — success
- shared tests, native Web build, Capacitor sync, Gradle APK assembly and fixed latest-development release all passed
- `random-seoul-latest.apk` updated 2026-09-19 KST, size `11,525,425` bytes

Detailed roadmap: `docs/VISIT_HISTORY_PLAN.md`.
