# WetBlessing

Campus romance VN web player. Suggestive / not adult. College characters 18+ (Kai, Mia, Jade, Vanessa).

## Slice-0

Next.js App Router + TypeScript + Tailwind player wired to `content/CONTENT-ch01-free-to-firstsub.json` (0.4.8-feel-hot) and Night Pass tokens in `content/UI-tokens.json`. Those fixtures are the only default content source.

- Default Ch01: `content/CONTENT-ch01-free-to-firstsub.json` @ 0.4.8-feel-hot (linked at `src/content/chapters/ch01.json`)
- P-D2 default load allowlist: `content/compile-allowlist.json` (only `0.4.8-feel-hot` / `route_kai_ch01`; deny `route_li_*` / `stage_0*` / `persona_li_*` / 黎包 / fourweek drafts)
- Click the dialogue box to advance lines
- Engine: `advance` / `advanceByFlag` / `gate:first_sub` on dialogue / `settle` / `requiresEntitlement` / `onLocked: show_pass_chip` / `cta: story_pass_month`
- `choiceIndex`: nodes with ≥2 choices count; continue / `advance` do not; the first_sub wall counts; `>10` with no gate fails compile
- In-dialogue `story_pass_month`: DEV fake-unlock then `unlockNext` (same line continues). No external store.
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

- Stripe Checkout for `story_pass_month`
- Auth / account entitlements
- Railway production deploy
