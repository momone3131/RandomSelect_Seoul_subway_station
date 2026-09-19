# Latest Change — Visit statistics image export blank-image fix

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

## Blank-image bug fix

iPhone Web 실사용에서 저장 PNG가 긴 종이색 배경만 나오고 통계 내용이 보이지 않는 문제가 확인되었습니다.

원인:
- export용 통계 dialog 자체에 큰 음수 left 좌표를 주어 화면 밖에 배치
- `html-to-image`가 그 root 위치를 그대로 직렬화하면서 실제 통계 내용도 PNG canvas 밖으로 밀림
- canvas 배경색만 남아 blank-looking PNG가 생성됨

수정:
- 캡처 대상 dialog는 `position:static` + viewport origin 좌표를 유지
- 별도 parent export host만 app 뒤의 negative z-index에 둠
- dialog의 전체 높이/내용은 그대로 렌더하고 `visit_statistics_body`의 scroll clipping만 해제
- 저장/닫기 control은 export에서 계속 제외
- export 완료 후 임시 host/clone은 즉시 제거

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
- PR #27 final CI `35423948838` — success
- source merge `12ba3c25209326536d8efff4d6c1d2ac3fdcac24`
- main CI `35423993757` — success
- Web Release `35423993692` — success
- deployment commit `7bafe6157f92fead723d4b7712b4940beb9fa925`
- Pages `35424023058` — success
- deployed bundle `assets/modular-oFZhZMoJ.js` + `assets/modular-DeBIqKyu.css`
- deployed bundle directly verified: export host present, captured dialog static/origin-based, old `left:-10000px` rule absent
- browser smoke verifies the prepared export contains every line row, expected text, full-height unclipped body, origin coordinates, hidden controls and cleanup

Android:
- branch `feature/random-seoul-android`
- source head `7dd3b9803770ed80e98c7bc3579fc77e50fa4222`
- Android CI `35424081669` — success
- shared tests / native Web build / Capacitor sync / Gradle APK / fixed release all passed
- latest APK `random-seoul-latest.apk` — `11,536,769` bytes

## Preserved behavior

- main random flow unchanged
- `등록 / 발자취`, recent-history `발자취 등록하기`, footprint map unchanged
- visit statistics aggregation rules unchanged
- no new persistence key
- no account / cloud backup policy introduced yet
