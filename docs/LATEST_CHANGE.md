# Latest Change — Visit statistics image export

Date: 2026-09-19

## Product behavior

방문 통계 modal 상단에 `이미지 저장` action을 추가했습니다.

저장 이미지는 별도 공유용 디자인을 다시 만드는 방식이 아니라 **현재 방문 통계 화면의 DOM/CSS를 그대로 복제**해 생성합니다.

- 현재 통계의 hero / 4개 metric card / 명소 등급 / 노선별 진행도 / 집계 기준 구조 유지
- modal viewport max-height / scroll clipping만 export clone에서 해제
- 닫기 / 이미지 저장 control은 저장 이미지에서 제외
- 현재 dialog width 유지
- 최대 2x pixel ratio PNG
- file name: `random-seoul-visit-statistics-YYYY-MM-DD.png`

따라서 화면에서는 기존처럼 스크롤 가능한 통계 modal이고, 저장 시에는 스크롤 전체 내용이 한 장의 긴 PNG로 만들어집니다.

## Platform behavior

Web:
- 브라우저 PNG download
- 별도 서버 업로드 없음

Android:
- shared TypeScript에서 동일 PNG를 생성
- `RandomSeoulPlatform.saveImage` native bridge로 device storage에 저장
- Android 10+: `Pictures/Random Seoul` via MediaStore
- older Android: app-specific Pictures/Random Seoul fallback + media scan
- storage/GPS permission 추가 없음

## UI

- 통계 header 오른쪽에 compact `이미지 저장`
- 저장 중에는 `저장 중…`
- 성공/실패는 기존 toast surface로 안내
- 저장 결과에는 close/save buttons가 포함되지 않음
- 통계 데이터/집계 방식/VisitRecord schema 변화 없음

## Verification

Web:
- PR #24 final CI `35420011134` — success
- source merge `259110cc363a0fac223d363b733873fddc69fdd1`
- main CI `35420042578` — success
- Web Release `35420042627` — success
- deployment commit `39c1af0f4feb6ef63018a9e339bf85fdb201b021`
- deployed bundle `assets/modular-BBtFqxHC.js` directly checked for `이미지 저장`, export clone, PNG filename and native-gallery bridge

Android:
- branch `feature/random-seoul-android`
- source head `49fc6fca089b52600a1bdc3b65875196752588d3`
- Android CI `35420098838` — success
- npm ci / shared tests / native Web build / Capacitor sync / native Java compile / APK assembly / fixed release all passed
- latest APK `random-seoul-latest.apk` — `11,536,165` bytes
- asset updated 2026-09-19 KST

## Preserved behavior

- main random flow unchanged
- `등록 / 발자취`, recent-history `발자취 등록하기`, footprint map unchanged
- visit statistics aggregation rules unchanged
- no new persistence key
- no account / cloud backup policy introduced yet
