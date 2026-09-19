# Latest Change — Compact visit statistics export

Date: 2026-09-19

## Product behavior

방문 통계 화면 자체는 기존 UI를 그대로 유지합니다.

`이미지 저장`을 눌렀을 때만 export clone에 별도 compact layout을 적용해, 기존의 긴 세로 PNG를 더 짧고 공유하기 좋은 형태로 저장합니다.

Saved-image-only layout:
- export canvas width: **720px**
- 전체 방문 hero: 기존 스타일 유지 + padding/font 약간 축소
- 총 방문 기록 / 최근 방문일 / 먹어본 음식·주류 / 다녀온 명소: **1행 4열**
- Diamond / Gold / Silver / Standard: **1행 4열**
- 24개 노선별 방문 진행도: **2열**
- export 전용 section/card gap과 padding을 소폭 축소
- `집계 기준` details는 저장 이미지에서 닫힌 상태로 고정
- `이미지 저장` / 닫기 control은 저장 이미지에서 제외
- live statistics modal의 폭/스크롤/모바일 배치는 변경하지 않음

이렇게 해서 저장 이미지는 현재 통계 디자인 언어를 유지하면서 세로 길이를 크게 줄입니다.

## Image generation

- `visit-statistics-export.ts`가 현재 통계 dialog를 clone
- 캡처 대상 dialog는 viewport origin에서 정상 layout
- parent export host만 app 뒤쪽 negative z-index에 배치
- export body의 viewport max-height / scroll clipping 제거
- `html-to-image`로 최대 2x pixel ratio PNG 생성
- filename: `random-seoul-visit-statistics-YYYY-MM-DD.png`

Web:
- PNG browser download

Android:
- 동일 PNG를 `RandomSeoulPlatform.saveImage` native bridge로 저장
- Android 10+: `Pictures/Random Seoul` via MediaStore
- older Android: app-specific Pictures fallback + media scan
- 추가 storage/GPS permission 없음

## Verification

Web:
- PR #29 final CI `35425218471` — success
- source merge `feef6eed043d881f39d3d8446ecfd50a50133f33`
- main CI `35425264337` — success
- Web Release `35425264330` — success
- deployment commit `98c9468974295d63e4b33ff5e90d43a21cc6c402`
- Pages `35425287239` — success
- deployed bundle: `assets/modular-CuQ0RdaE.js` + `assets/modular-8Qj5uNTE.css`
- deployed bundle checked for compact export class, 720px width, 4-column summary and 2-column line layout

Android:
- branch `feature/random-seoul-android`
- source head `a7aa21724f19ebe56f7dd2a4831206bdce12928a`
- Android CI `35425286104` — success
- shared tests / native Web build / Capacitor sync / APK assembly / fixed release all passed
- latest APK `random-seoul-latest.apk` — `11,537,461` bytes
- asset updated 2026-09-19 KST

## Preserved behavior

- live 방문 통계 modal unchanged
- 방문 통계 aggregation rules unchanged
- `등록 / 발자취`, recent-history `발자취 등록하기`, footprint map unchanged
- no new persistence key
- no GPS/location permission change
- account/cloud backup direction remains undecided
