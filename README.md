# WetBlessing

Campus romance visual novel web player (Slice-0).

Suggestive / not adult. College characters 18+ (Kai, Mia, Jade, Vanessa).

Content source is the Ch01 fixture on `main` — do not add a parallel sample chapter:

- `content/CONTENT-ch01-free-to-firstsub.json` (`0.4.6-midboard`)
- `content/UI-tokens.json` (Night Pass)
- `public/assets/` artReady pack

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click dialogue to advance. The Night Pass bar is the bottom **28%**.

## Test & build

```bash
npm test
npm run build
```

## Slice-0 locks

- Click-sentence VN; static CG + light motion
- `choiceIndex` increments on branching choices only (`advance` / `advanceByFlag` do not)
- First subscription wall `first_sub` at `n_ch01_first_sub`, within ≤10 branching choices
- In-dialogue CTA `story_pass_month` — DEV fake unlock calls `unlockNext` (no store link)
- `n_pay_02_router` is `advanceByFlag` only (not shown as a continue beat)

## TODO (not in Slice-0)

- Auth
- Real Stripe Checkout for `story_pass_month`
- Railway deploy
- Sparse AI barks on flagged nodes only
