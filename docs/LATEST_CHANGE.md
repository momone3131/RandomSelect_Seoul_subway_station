# Latest Change — Main visit UX promotion

Date: 2026-09-19

## Product decision

방문 기록과 발자취는 장기 사용의 핵심 기능이므로 최근 추첨 기록 아래에 묻히지 않도록 메인 결과 흐름 가까이 올립니다.

또한 코스가 완성된 직후 최근 기록까지 내려가지 않아도 같은 방문 기록 picker를 열 수 있게 합니다.

## Main UI changes

- 메인 `바로 뽑기 (애니메이션 없이)` 체크박스를 제거
- production draw는 기존 settle/reveal animation을 항상 사용
- 과거 저장된 instant preference가 있더라도 메인 추첨 동작에는 더 이상 영향을 주지 않음
- `발자취` hub를 최근 추첨 기록 아래에서 위로 이동
- 최종 위치는 curated `추천 명소`와 `복사 · 네이버지도 · 구글지도` action row 다음
- live 추천 식당/술집 결과보다 **위**에 유지하여 Places 결과를 펼쳐도 발자취가 다시 아래로 밀리지 않음
- 기존 `발자취 노선도 보기` + `방문 통계` sibling actions 유지

## Current-course visit action

코스가 `노선 + 역 + 음식/주류`까지 완성되면:

- `이 코스로 가기` 버튼을 `새 코스` 바로 왼쪽에 표시
- 두 버튼은 완료 상태에서 같은 row에 나란히 배치
- `이 코스로 가기`는 최근 추첨 카드의 `다녀왔어요`와 **동일한 방문 기록 picker**를 엶
- 역은 필수, 음식/명소/방문일은 기존 visit contract 그대로 적용
- 저장 후 같은 버튼은 `발자취에 등록됨`으로 바뀌고 비활성화
- 동일 source history record로 중복 방문 기록을 만들지 않음

최근 추첨 목록의 `다녀왔어요` 진입도 그대로 유지합니다.

## Verification

Web:
- PR #17 CI `35368693765` — success
- current-course action + instant UI removal + initial footprint promotion
- PR #18 CI `35368949986` — success
- footprint hub final placement directly below map actions
- final source merge `7bdfcc2f65e35be10bf006005545884b5c298e6a`
- main CI `35369033009` — success
- Web Release `35369033238` — success
- deployment commit `e633c7b3bb63ffb5d24ba2e23a94fdb4bc556460`
- deployed bundle `assets/modular--Htlab0P.js`
- deployed bundle directly checked: `이 코스로 가기` / `발자취에 등록됨` present, `바로 뽑기` absent

Android:
- branch `feature/random-seoul-android`
- synced source head `de2e21cb463adc088fa60164bb6d5c1fad44ed82`
- Android CI `35369057004` — success
- shared tests, native Web build, Capacitor sync, APK assembly and fixed latest-development release all passed
- `random-seoul-latest.apk` size `11,526,053` bytes

