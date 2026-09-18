# Random Seoul — Architecture

Last updated: 2026-09-18

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 동일한 제품 로직을 공유하도록 설계합니다.

- draw/static data/state/ranking = platform-independent TypeScript
- native code stays thin
- live provider lookup only after explicit user request
- attractions and food taxonomy are first-party static data

## 2. Repository structure highlights

```text
src/
├─ application/
│  └─ random-seoul-controller.ts
├─ data/
│  ├─ subway-lines.ts
│  ├─ food-categories.ts
│  ├─ food-category-features.ts
│  ├─ curated-attractions.ts
│  ├─ curated-attractions-base.ts
│  ├─ curated-attractions-adjustments.ts
│  ├─ curated-attractions-extra.ts
│  ├─ curated-attractions-local.ts
│  ├─ curated-attractions-night-viewpoints.ts
│  ├─ curated-attraction-tiers.ts
│  ├─ curated-attraction-features.ts
│  ├─ station-equivalence.ts
│  └─ station-coordinates.ts
├─ domain/
├─ services/
├─ state/
└─ ui/
```

## 3. Draw flow

`line → station → food/alcohol category`

Station draw immediately attaches static curated attractions. Category draw does **not** call Google Places.

After the explicit recommendation CTA:
1. resolve station center
2. issue category-specific Google Places query
3. type-gate candidates
4. hard 2 km filter
5. shared ranking
6. TOP3 render
7. smooth scroll after result settles

## 4. Food taxonomy / alcohol feature

`food-categories.ts` owns 42 draw categories.

`food-category-features.ts` marks exactly six IDs as alcohol-primary:
- `b_izakaya`
- `b_wine`
- `b_cocktail`
- `b_craft_beer`
- `b_traditional`
- `b_whisky`

This is a feature flag, not a second food hierarchy. Ordinary food categories are not alcohol-primary merely because the venue may serve drinks.

`SettingsModalView` owns the dynamic alcohol preset:
- any alcohol selected → `주류 제외`
- zero alcohol selected → `주류 포함`

The preset mutates draft selection only; `적용` persists it through the existing selected-food IDs contract.

Persistence migration in `app-persistence.ts` treats an exact legacy full-36 selection as old “all selected” and expands it to current full-42. Any deliberately narrowed saved selection is preserved.

`RandomSeoulController.isFoodCandidate()` uses:
- normal food set for meal categories
- alcohol-oriented type set for alcohol categories: `bar`, `night_club`, with `restaurant`/`food` fallback for venues such as izakaya and traditional liquor pubs

Ranking remains shared and unchanged: hard 2 km, max20 candidates, rating 55%, review volume 25%, relevance 15%, distance 5%, TOP3.

UI context carries `isAlcohol` so recommendation title/CTA/empty copy can say `술집` while normal categories keep `식당`. Result-copy wording uses `가자!` for alcohol and `먹자!` for meal categories.

## 5. Curated attraction merge

Before curation layers are merged, `station-equivalence.ts` expands a draw station to all line variants of the same physical interchange. The expansion is canonical and line-independent, so 왕십리/연신내/도봉산/etc. cannot return different attraction sets merely because a different line was drawn.

Same-name stations that are not physical interchanges are explicitly excluded from automatic equivalence: 신촌 and 양평. The differently named 이수 interchange is explicitly paired as `l4:총신대입구(이수)` ↔ `l7:이수`.

Exact order:
1. physical interchange equivalence
2. base
3. station adjustments
4. extra
5. local
6. dedicated night-viewpoints
7. ID dedupe
8. max2
9. prominence tier attachment
10. orthogonal feature attachment

The night-viewpoint layer is last so it only fills available capacity.

### Prominence
- Diamond 4
- Gold 25
- Silver 88
- remaining Standard

### Nightscape
Nightscape is orthogonal to tier and means an elevated city-light viewpoint, not simply a place that looks good at night.

Current 12 IDs:
`n-seoul-tower`, `naksan-park`, `eungbongsan-palgakjeong`, `dalmaji-bong-park`, `maebongsan-palgakjeong`, `yongwangsan-skywalk`, `samsung-haemaji-park`, `yongmasan-skywalk`, `yongyangbongjeojeong-park`, `lotte-world-tower`, `namhansanseong-west-gate-viewpoint`, `suwon-hwaseong-seojangdae`.

## 6. UI composition

- attraction tier owns outer border/effect
- Nightscape owns card interior/background
- no tier/nightscape text badge
- same-result signature guard prevents repeated reveal
- reduced-motion disables tier motion

## 7. Storage / platform boundary

- Web localStorage / Android WebView-compatible shared state
- preferences/history persisted
- live recommendation result not kept as long-term own DB
- missing station center may use Google fallback with 30-day cache
- no current-location/GPS permission required

## 8. Build / deployment

Web: tests → Vite build → browser smoke → verified root promotion → Pages.

Android: shared tests → native Web build → Capacitor sync → Gradle debug APK → artifact → fixed `android-dev-latest` Release.
