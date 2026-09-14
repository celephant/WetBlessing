# Scene presentation hooks

Optional fields on a dialogue **node** or a **stage line**. Missing fields still get defaults. The 0.4.7-feel Chinese fixture sets `fx` / `camera` (e.g. `warm_dust`, `close`); the player maps those words onto the shipped overlays / Ken Burns primitives below.

| Field | Where | Values | Missing default |
|---|---|---|---|
| `transition` | node or line | `fade` · `soft-zoom` · `dip-to-black` | Token defaults: intimate soft-zoom · SMS/wall dip · after purchase soft-zoom · else cycle |
| `camera` | node or line | `hold` · `kenburns` · `breathe` · `kenburns-right` · `kenburns-left` · `kenburns-up` | Auto-cycle Ken Burns / breathe while consecutive lines share the same resolved art |
| `fx` | node or line | `none` · `vignette` · `warm-tint` · `soft-light` | intimate `warm-tint` (warmVeil+magentaMist); night `vignette` on SMS / wall |

Line values override the node. `dip-to-black` is a brief night-grade veil (`#07080C`, not `#000`) — art or the existing gradient placeholder stays underneath (never a stuck pure-black frame). Image errors still use `resolveAssetUrl` + the SceneArt placeholder.

## Scale lock (investor / CEO)

Player chrome and any UI copy we touch stay **bold suggestive, not adult**:

- Allowed: 半露 / wetness implication / disheveled clothing edge, close camera, warm veil + magenta mist, breathing motion.
- Forbidden: visible nipples/genitals, explicit sex acts or how-to sex prose, adult-site red/black neon (`#FF0033`, black-red chrome). No extra adult art packs.

`warm-tint` is warmVeil + magentaMist. Ken Burns peaks at **1.028 / 14s** with a small breathe. Product marketing remains a browser VN.

## Motion spec (Design Lead lock)

Sourced from `content/UI-tokens.json` **v1.1** (`motion` / `transitions` / `grade`). `MOTION_SPEC` and CSS custom properties read those numbers.

| Beat | Timing |
|---|---|
| Dialog first enter | 220ms · `cubic-bezier(0.22, 1, 0.36, 1)` · `translateY(12px)` |
| Same-node continue | 140ms · `translateY(6px)` |
| Nameplate | delay 60ms · fade 120ms |
| Choice chips | 160ms · stagger 48ms · Y(8) + scale(0.98) |
| fade / soft-zoom / dip | 320 / 420 / 380ms · dip overlay `#07080C` (in 120 + hold 40 + out 220) |
| Ken Burns | peak 1.028 · ~14s + nested breathe |
| Grade | warmVeil+magentaMist on intimate nodes; night vignette on SMS / first-sub wall |
| Wall rhythm | dip → chips → gold yuan **once** → DEV unlock soft-zoom |
| PhoneGlow | **off** on SMS + paywall |

Forbidden: bounce springs, confetti, heartbeat bars, shake >2px, flash-white >80ms, adult red/black neon (`#FF0033`).
