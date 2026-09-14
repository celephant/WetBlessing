# WetBlessing

Campus romance VN web player. Suggestive / not adult. College characters 18+ (Kai, Mia, Jade, Vanessa).

## Slice-0

Next.js App Router + TypeScript + Tailwind player wired to `content/CONTENT-ch01-free-to-firstsub.json` (0.4.6-midboard) and Night Pass tokens in `content/UI-tokens.json`.

- Click the dialogue box to advance lines
- `choiceIndex` increments only on player branches (not `advance` / `advanceByFlag`)
- `first_sub` wall is reached at choiceIndex ≤ 10
- In-dialogue `story_pass_month` paywall with **DEV fake-unlock** (no Stripe)

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
