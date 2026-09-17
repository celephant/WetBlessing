# WetBlessing

Campus romance VN web player. Suggestive / not adult. College characters 18+ (Kai, Mia, Jade, Rae 18 JK/sailor fashion, Lina, Vanessa, Reina 29 lecturer).

## Slice-0

Next.js App Router + TypeScript + Tailwind player wired to `content/CONTENT-ch01-free-to-firstsub.json` (0.4.8-feel-hot) and Night Pass tokens in `content/UI-tokens.json`. Those fixtures are the only default content source.

- Default Ch01: `content/CONTENT-ch01-free-to-firstsub.json` @ 0.4.8-feel-hot (linked at `src/content/chapters/ch01.json`)
- DEV Ch02 cafeteria + Reina office: `/play?content=ch02` (pack `content/CONTENT-ch02-office.json`; does **not** replace default Ch01). Title screen link: **DEV ch02 办公室**. Chapter-start wall is `w2_office`; 躲开 the Reina kiss is a story abort, not a second SKU. Header **DEV PASS** mints pass + `w1_continue` + `w2_office` + `w3_edge_night`.
- After Ch01 paid coda, settle **继续 · 账单与办公室**. After Ch02, **继续 · 闭馆夜**. After Ch03 (pass / `w3_edge_night`, or bind `none` with Ch02), **继续 · 名分**. Default `/play` stays Ch01.
- P-D2 default load allowlist: `content/compile-allowlist.json` (only `0.4.8-feel-hot` / `route_kai_ch01`; deny `route_li_*` / `stage_0*` / `persona_li_*` / 黎包 / fourweek drafts)
- Click the dialogue box to advance lines
- Engine: `advance` / `advanceByFlag` / `gate:first_sub` on dialogue / `settle` / `requiresEntitlement` / `onLocked: show_pass_chip` / `cta: story_pass` (old `story_pass_month` still parses)
- `choiceIndex`: nodes with ≥2 choices count; continue / `advance` do not; the first_sub wall counts; `>10` with no gate fails compile
- In-dialogue walls: DEV `$2.99` fake-unlocks **one** scope (`w1_continue` / `w2_office` / `w3_edge_night`). Header **DEV PASS** mints the one-time pass (all scopes). No Stripe. Not a month card.
- Night Pass dialog dock is 28% of the viewport
- Paid CG aliases (do not key art by nodeId): [`docs/ART-assetId-aliases.md`](docs/ART-assetId-aliases.md)
- Optional scene hooks (`fx` / `camera` / `transition`) and player motion: [`docs/scene-presentation.md`](docs/scene-presentation.md)

```bash
npm install
npm test
npm run build
npm run dev
```

## TODOs (later slices)

- Stripe Checkout for `story_pass`
- Auth / account entitlements
- Railway production deploy
