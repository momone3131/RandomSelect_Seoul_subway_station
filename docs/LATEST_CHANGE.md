# Latest Change — Simplified main visit UX

Date: 2026-09-19

## Product decision

방문 기능은 유지하되 메인 화면에서 별도 모듈/강한 CTA를 줄여 랜덤 추첨 UI가 복잡해 보이지 않도록 정리합니다.

## Completed-course registration

코스가 `노선 + 역 + 음식/주류`까지 완성되면 상단 headline은 기존대로 `이 코스로 가자!`가 됩니다.

그 오른쪽에 작은 상태 버튼 하나만 표시합니다.

- 미등록: `등록`
  - 누르면 최근 기록의 `다녀왔어요`와 동일한 visit picker를 엶
- 등록 완료: `발자취`
  - 누르면 해당 방문을 포함한 발자취 노선도를 바로 엶

`새 코스`는 다시 원래 단독 primary action 위치로 복귀했고, `추천 식당 보기 / 추천 술집 보기` 흐름도 기존 위치를 유지합니다.

## Footprint / statistics entry

메인 화면의 별도 `발자취` 카드/제목/카운트 모듈은 제거했습니다.

대신 `XX선 역 목록` control 바로 아래에 중립적인 유틸리티 버튼 2개만 둡니다.

- `발자취 노선도`
- `방문 통계`

두 버튼은 역 목록과 비슷한 낮은 시각 강조를 사용합니다. 발자취 노선도는 방문 기록이 없으면 disabled이고 방문 통계는 항상 열 수 있습니다.

## Preserved behavior

- 최근 외출 코스의 `다녀왔어요` 진입은 그대로 유지
- current-course `등록`과 recent-history `다녀왔어요`는 같은 `VisitRecord` / source-history contract 사용
- 같은 코스의 중복 등록 방지
- 방문 기록 수정/삭제는 발자취 노선도 상세에서 수행
- 방문 통계의 환승역/명소 등급 집계 규칙 unchanged
- main `바로 뽑기` checkbox는 계속 제거 상태이며 normal reveal animation 유지
- persistence schema / GPS permission 변화 없음

## Verification

Web:
- PR #20 CI `35371137305` — success
- source merge `411c67d53d34e28ce0d161d41dead99ec563b38c`
- main CI `35371239332` — success
- Web Release `35371239392` — success
- deployment commit `9c4bbb70fcde5f6ca5dc2b7ac27df9dfe5379411`
- Pages `35371297273` — success
- public bundle `assets/modular-CaV-K9e8.js`
- deployed bundle checked: `등록`, `발자취`, `새 코스`, `추천 식당 보기`, `발자취 노선도`, `방문 통계` present; old `이 코스로 가기` button and `발자취 노선도 보기` module copy absent

Android:
- branch `feature/random-seoul-android`
- synced source head `4a568e6caf9325c72f85bead1ea9f6b1de105b8a`
- Android CI `35371313423` — success
- shared tests, native Web build, Capacitor sync, APK assembly and fixed latest-development release all passed
- `random-seoul-latest.apk` size `11,525,705` bytes
