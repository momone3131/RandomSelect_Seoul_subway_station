# Latest Change — Full-card draw interaction

Date: 2026-09-15

## Product decision

The active random-draw card itself is now the primary action target. The previous compact button placed at the bottom of the active card is no longer shown as a separate visible control.

Current interaction:

- line stage → tap/click anywhere on the line card
- station stage → tap/click anywhere on the station card
- food stage → tap/click anywhere on the food card
- completed course → keep the existing lower “새 코스 다시 뽑기” action and the existing partial-redraw/map/copy actions

The real `draw_btn` is still kept for button semantics, keyboard accessibility, the existing event handler and screen-reader labeling. During line/station/food stages it is stretched invisibly across the full `.next-draw` card, so the visual card and the actual hit target are the same area.

## Visual affordance

The active card must read clearly as a pressable control, not just as a highlighted result panel.

Current treatment:

- strong dark-green 2 px border
- lime/soft-lime gradient surface
- raised bottom shadow that makes the card look physically elevated
- stronger hover lift on pointer devices
- pressed state that drops the card downward and collapses the shadow like a real button
- dark-green circular **dice** indicator at the top-right corner
- the top-right indicator owns reserved layout space so it does not cover the panel label text
- narrow phones reduce the dice badge size while preserving the reserved text area
- no extra instructional copy added; the emphasis is visual rather than text-heavy

Inactive cards keep their quieter panel styling so the active card is immediately distinguishable.

## UI cleanup

The main surface hides copy that duplicated information already communicated by the cards and progress steps:

- `progress-note`
- `helper`
- keyboard shortcut note
- toolbar “각 단계 균등 추첨” suffix
- fairness note beside the instant-draw option

The draw cards keep their meaningful result/placeholder content. The completed-course primary restart behavior remains unchanged.

## Implementation

Main/Web:

- `src/ui/mobile-overrides.css`
  - full-card transparent button overlay
  - raised active-card button styling
  - active-card hover/press/focus feedback
  - top-right circular dice affordance
  - reserved `panel-tag` space to prevent icon/text overlap
  - duplicate-copy cleanup
- `tests/responsive-contract.test.ts`
  - guards full-card hit area (`inset: 0`, `height: 100%`, invisible real button)
  - guards raised-button visual treatment and press state
  - guards dice affordance and reserved label space
  - guards removal of duplicate guidance copy

Android branch receives the same shared Web UI/CSS contract so Web remains the fast validation surface for the Android product.

## Commits and verification

Main/Web source:

- initial full-card UI commit: `b74eec6f550a1bfe75ec7386defa3095062f0b91`
- initial contract-test commit: `ba219ceb757c5362bb0cd5cb81e6e4aa8a6acd19`
- raised-button visual commit: `c14f2ada3ec960ebe27c1cb66b22d888ce223108`
- raised-button contract-test commit: `ed2e12126ea826a450bf38a0c9e593df34e47188`
- dice affordance commit: `3ee299e47c191d49ad9bdad1d34b8fcd670e7cf0`
- dice contract-test commit: `4308a1c0c5f9a0d55db31110576785b14aedc242`
- previous raised-button CI run `34934970986`: success

Android branch:

- initial full-card UI commit: `5dd0ee17ec6569f6af889720fe99c95487c4ecfd`
- initial contract-test head: `0d1abd49f9e8e34d8c598a8c43b796e8d4837c2c`
- raised-button visual commit: `1a404956136c5770f9d931730122a7afb4250bf8`
- raised-button contract-test head: `41686a9db1652419d7b3d6bb5f7457b16caf2523`
- dice affordance commit: `e92254324b4c0cdb836171ac0510ddfe8951b0de`
- dice contract-test head: `ec59172c4d3252ed838b91e7e0598c7a1783362c`
- previous raised-button Android CI run `34934950401`: success

## Handoff rule

Do not restore a visible compact CTA inside the line/station/food cards unless the product decision changes. The intended interaction is **full-card tap/click** with the real button retained invisibly for semantics and accessibility. The active card should remain visually stronger than inactive cards and should feel like a raised button through surface, border, shadow and press motion rather than through added instructional text. The top-right action cue is a dice icon, not an arrow, and it must not overlap card labels.
