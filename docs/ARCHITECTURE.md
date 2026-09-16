# Random Seoul — Architecture

Last updated: 2026-09-17

## 1. Architecture goals

Random Seoul은 Web / Android / iOS가 동일한 제품 로직을 공유하도록 설계합니다.

- draw/static data/state/restaurant ranking = platform-independent TypeScript
- native code stays thin
- restaurant candidates come from live provider; shared TypeScript ranks them
- attractions and station centers are owned static data where possible
- restaurant lookup runs only on explicit request

## 2. Repository structure

```text
src/
├─ application/
├─ data/
│  ├─ subway-lines.ts
│  ├─ food-categories.ts
│  ├─ curated-attractions.ts
│  ├─ curated-attractions-base.ts
│  ├─ curated-attractions-adjustments.ts
│  ├─ curated-attractions-extra.ts
│  ├─ curated-attractions-local.ts
│  ├─ curated-attractions-night-viewpoints.ts
│  ├─ curated-attraction-tiers.ts
│  ├─ curated-attraction-features.ts
│  └─ station-coordinates.ts
├─ domain/
├─ services/
├─ state/
└─ ui/
```

## 3. Draw → attraction → restaurant flow

`line → station → food`

Station draw calls `getCuratedAttractions()` and stores static 0–2 attractions immediately. Food draw does not trigger restaurant network lookup. After explicit `추천 식당 보기`, the provider returns restaurant candidates and shared TypeScript performs 2 km filtering/ranking/TOP3.

## 4. Curated attraction merge

Exact order:

1. `curated-attractions-base.ts`
2. `curated-attractions-adjustments.ts`
3. `curated-attractions-extra.ts`
4. `curated-attractions-local.ts`
5. `curated-attractions-night-viewpoints.ts`
6. ID dedupe
7. `slice(0, 2)`
8. prominence tier attachment
9. orthogonal feature attachment

The dedicated night-viewpoint layer is deliberately **last**. It is intended to fill spare slots with valuable elevated viewpoints without displacing an already established stronger recommendation.

### Domain model

```ts
tier?: 'diamond' | 'gold' | 'silver' | 'standard'
nightscape?: boolean
```

Prominence and Nightscape are separate dimensions.

### Prominence

Current classifier:
- Diamond 4
- Gold 25
- Silver 88
- remaining surfaced IDs Standard

Diamond is fixed to 경복궁 / 국립중앙박물관 / 롯데월드타워 / 북촌한옥마을.

Latest night-viewpoint-related tiers:
- N서울타워 = Gold
- 응봉산 팔각정 / 남한산성 서문 전망대 / 수원화성 서장대 = Silver
- 달맞이봉공원 / 매봉산 팔각정 / 용왕산 스카이워크 / 삼성해맞이공원 / 용마산 스카이워크 / 용양봉저정공원 = Standard

### Nightscape feature

`curated-attraction-features.ts` owns Nightscape tagging. It is not a fifth tier.

Strict semantic rule: the destination should be an **elevated city-light viewing point where the night panorama itself is a primary reason to visit**.

Current 12 IDs:
- `n-seoul-tower`
- `naksan-park`
- `eungbongsan-palgakjeong`
- `dalmaji-bong-park`
- `maebongsan-palgakjeong`
- `yongwangsan-skywalk`
- `samsung-haemaji-park`
- `yongmasan-skywalk`
- `yongyangbongjeojeong-park`
- `lotte-world-tower`
- `namhansanseong-west-gate-viewpoint`
- `suwon-hwaseong-seojangdae`

Not Nightscape merely because they are illuminated/pleasant at night: DDP, 노들섬, 반포한강공원, 세빛섬, 석촌호수, 송도 센트럴파크, 광교호수공원, 라베니체. Their normal attraction data and prominence tier remain intact.

### UI composition

`attraction-view.ts` adds:
- `attraction-tier-${tier}`
- independent `attraction-nightscape` when applicable

The render signature includes station + attraction ID + tier + `night/plain`, preventing unrelated rerenders from replaying arrival effects.

`minimal-palette-overrides.css` owns presentation:
- Diamond: gemstone prism border and sparkle
- Gold/Silver: metallic borders
- Standard: borderless
- Nightscape: card interior only, with dark navy/indigo/purple sky, star points and subtle city glow

This allows combinations such as:
- 롯데월드타워 = Diamond + Nightscape
- 응봉산 팔각정 = Silver + Nightscape
- 용왕산 스카이워크 = Standard + Nightscape

## 5. New viewpoint mappings

`curated-attractions-night-viewpoints.ts` currently maps:
- 충무로 → N서울타워
- 응봉 → 응봉산 팔각정
- 옥수 → 달맞이봉공원
- 버티고개 → 매봉산 팔각정
- 신목동 → 용왕산 스카이워크
- 청담 → 삼성해맞이공원
- 사가정 → 용마산 스카이워크
- 노들 → 용양봉저정공원
- 산성 / 남한산성입구 → 남한산성 서문 전망대
- 화서 → 수원화성 서장대

All are still subject to the global max2 result cap and preceding layer priority.

## 6. Attraction map-target strategy

Attraction lat/lng is not stored. Each result uses a self-contained `mapQuery`.

- no station-name suffix auto-append
- ambiguous destinations add district/address context
- broad viewpoints use a specific named viewpoint/entrance when possible
- wrong pin risk > omit

## 7. Restaurant ranking

Hard 2 km radius, max20 candidates, TOP3. Weights: rating 55%, review volume 25%, Google relevance 15%, distance 5%.

Provider result/rating/review values are not persisted as a reusable long-term restaurant DB.

## 8. Station center / storage / platform boundary

- static station coordinates first; missing only → Google fallback with 30-day cache
- Web localStorage / Android WebView-compatible storage
- Android native bridge owns platform Places/haptics/map/share behavior
- current GPS/current-location permission: none

## 9. Build / deployment

Web: tests → Vite build → browser smoke → root promotion → Pages.

Android: shared tests → native Web build → Capacitor sync → Gradle `assembleDebug` → artifact → fixed `android-dev-latest` Release.

Web and Android share the same attraction data, tiers and Nightscape feature logic.
