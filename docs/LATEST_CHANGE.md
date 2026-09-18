# Latest Change — Durable visit history Phase 1

Date: 2026-09-18

## Product decision

Random draw history and real-world visit history are now separate concepts.

A station appearing in recent history does not mean the user visited it. The user explicitly chooses `다녀왔어요`.

## Visit selection contract

Mandatory:
- drawn station

Optional, user-confirmed only:
- the drawn food/alcohol category
- any of the 0–2 curated attractions that were shown for that draw
- visit date

The food and attraction checkboxes start unchecked. Multiple attractions can be selected. Google Places restaurant recommendations are not stored as visit choices.

## Persistence

- recent draw history: `next_stop_history_v1`, max12
- durable visits: `random_seoul_visits_v1`
- clearing recent history leaves visits untouched
- new draw records snapshot shown attraction IDs/names so later curation changes do not silently rewrite the original visit choices
- legacy history without a snapshot falls back to current station curation

## UI

- recent history card: `다녀왔어요`
- already saved: `방문 기록 수정`
- separate `다녀온 곳` list
- visit records can be edited/deleted
- date defaults to today for a new visit but may be cleared
- station-only visit is valid

## Long-term roadmap

1. durable visit records — current phase
2. footprint map
3. unvisited-first / visited-excluded random options
4. simple personal visit statistics

Detailed roadmap: `docs/VISIT_HISTORY_PLAN.md`.


## Verification

- Web CI `35339108030` — success
- Web Release `35339108075` — success
- Pages deployment — success
- Android CI `35339228627` — success
- Android latest development APK republished successfully
