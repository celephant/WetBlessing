# Scene presentation hooks

Optional fields on a dialogue **node** or a **stage line**. Missing fields still get defaults. The 0.4.8-feel-hot Chinese fixture may set `fx` / `camera` / `transition`; the player maps those words onto shipped overlays and then **pins the still**.

| Field | Where | Values | Player default |
|---|---|---|---|
| `transition` | node or line | JSON may name `fade` · `soft-zoom` · `dip-to-black` | **fade** on `assetId` change, then hold |
| `camera` | node or line | JSON may name Ken Burns / breathe words | **hold** — no Ken Burns, breathe, or crop-cycle |
| `fx` | node or line | `none` · `vignette` · `warm-tint` · `soft-light` | intimate `warm-tint` (warmVeil+magentaMist); night `vignette` on SMS / wall |

Each still shows in full (`object-fit: contain`). Letterboxed thumbs, `object-cover` crops, and `wide→mid→close` hunting are off. Pause, title idle, settle, and paywall wait as stopped design — no plate drift.

Image errors still use `resolveAssetUrl` + the SceneArt placeholder.

## Scale lock (investor / CEO)

Player chrome and any UI copy we touch stay **bold suggestive, not adult**:

- Allowed: 半露 / wetness implication / disheveled clothing edge, warm veil + magenta mist.
- Forbidden: visible nipples/genitals, explicit sex acts or how-to sex prose, adult-site red/black neon (`#FF0033`, black-red chrome). No extra adult art packs.

`warm-tint` is warmVeil + magentaMist. Product marketing remains a browser VN.

## Motion spec (Design Lead lock)

Sourced from `content/UI-tokens.json` **v1.1** (`motion` / `transitions` / `grade`). `MOTION_SPEC` and CSS custom properties read those numbers. Plate motion ignores Ken Burns / breathe token peaks.

| Beat | Timing |
|---|---|
| Dialog first enter | 220ms · `cubic-bezier(0.22, 1, 0.36, 1)` · `translateY(12px)` |
| Same-node continue | 140ms · `translateY(6px)` |
| Nameplate | delay 60ms · fade 120ms |
| Choice chips | 160ms · stagger 48ms · Y(8) + scale(0.98) |
| Scene still | **fade 320ms** on asset change, then static contain |
| Grade | warmVeil+magentaMist on intimate nodes; night vignette on SMS / first-sub wall |
| Wall rhythm | chips + gold yuan **once** (plate stays a still) |
| PhoneGlow | **off** on SMS + paywall |

Forbidden: bounce springs, confetti, heartbeat bars, shake >2px, flash-white >80ms, adult red/black neon (`#FF0033`), looping Ken Burns / breathe, crop-cycle, letterboxed thumbs.
