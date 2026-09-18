# Random Seoul — Footprint Full-Network Reference Map

Last updated: 2026-09-18

이 문서는 `발자취 노선도`의 전체 수도권 전철 기준도와 station-anchor 생성/검증 규칙을 기록합니다.

## 1. Reference asset

Canonical reference:
- Wikimedia Commons: `File:Seoul subway linemap ko.svg`
- canonical page: `https://commons.wikimedia.org/wiki/File:Seoul_subway_linemap_ko.svg`
- author: IRTC1015
- license: Public Domain
- reference revision used: 2025-06-29
- logical canvas: `5724 × 6516`

Repository asset:
- `public/footprint-seoul-subway-reference.svg`

The repository copy was transported from a public GitHub mirror of the same current SVG. Wikimedia Commons remains the provenance source of truth.

The chosen revision includes the current reference-map updates for the Incheon Line 1 extension and GTX-A correction. The app does not use the user's uploaded screenshot as a coordinate source.

## 2. Anchor extraction

Generator:
- `scripts/generate-footprint-map-anchors.mjs`

Generated output:
- `src/data/footprint-map-anchors.ts`

Method:
1. read the bundled SVG
2. extract each Korean station label's SVG `matrix(... x y)` origin
3. concatenate multi-line `tspan` text and remove whitespace
4. match every app `lineId:stationName` outcome against the reference label
5. refuse generation on missing or ambiguous labels unless an explicit disambiguation is declared
6. write a typed static anchor table

The key includes the app line ID so same-name non-interchanges can have different positions.

## 3. Explicit disambiguation

The following are intentional, reviewed mappings rather than fuzzy guesses:

- 2호선 `신촌` → reference label `신촌(지하)`
- 경의중앙선 `신촌` → reference label `신촌(경의선)`
- 5호선 `양평` → western Seoul `양평` occurrence
- 경의중앙선 `양평` → eastern Gyeongui-Jungang `양평` occurrence
- 4호선 `총신대입구(이수)` → reference label `이수`
- 7호선 `이수` → the same physical `이수` reference anchor

Multi-line labels such as `동대문역사문화공원`, `서울지방병무청`, and `경기도청북부청사` are recovered by concatenating their SVG `tspan` text.

## 4. One documented reference exception

`의정부경전철:차량기지 임시승강장` is included in Random Seoul's draw data but is not labeled on the chosen public-domain reference SVG.

It is therefore the **only synthetic anchor**:
- key: `gj:차량기지 임시승강장`
- source tag: `synthetic-terminal-extension`
- placement: short continuation beyond `탑석` following the terminal track direction
- the UI renders its continuation as a dashed extension so it is not misrepresented as part of the reference SVG

No other station may silently fall back to a guessed coordinate.

## 5. Automated audit gates

`tests/footprint-reference-map.test.ts` requires:

- exactly **800** unique app line/station outcomes
- exactly **800** generated anchors
- every anchor inside the `5724 × 6516` reference viewBox
- every physical-interchange line variant at the same anchor
- 2호선/경의중앙선 신촌 remain different
- 5호선/경의중앙선 양평 remain different
- exactly one synthetic exception, the depot temporary platform
- every consecutive pair inside every stored line segment has a non-zero, bounded reference-map distance

`tests/footprint-schematic-contract.test.ts` additionally locks the UI behavior:
- one integrated reference map, not line-by-line rows
- pan / wheel zoom / pinch zoom / fit-all
- selecting a visited station updates marker selection + detail only
- selection does **not** rebuild or reposition the map

## 6. Update rule

When subway data or the reference SVG changes:

1. replace the bundled reference only with a provenance-reviewed revision
2. run `npm run generate:footprint-anchors`
3. run the full test suite
4. inspect any new missing/ambiguous station explicitly
5. never add fuzzy or guessed mappings just to make the count pass
