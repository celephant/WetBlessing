# Scene presentation hooks

Optional fields on a dialogue **node** or a **stage line**. Missing fields still get defaults. The 0.4.7-feel Chinese fixture sets `fx` / `camera` (e.g. `warm_dust`, `close`); the player maps those words onto the shipped overlays / Ken Burns primitives below.

| Field | Where | Values | Missing default |
|---|---|---|---|
| `transition` | node or line | `fade` · `soft-zoom` · `dip-to-black` | Cycle those three whenever the resolved scene URL **or** authored `assetId` changes |
| `camera` | node or line | `hold` · `kenburns` · `breathe` · `kenburns-right` · `kenburns-left` · `kenburns-up` | Auto-cycle Ken Burns / breathe while consecutive lines share the same resolved art |
| `fx` | node or line | `none` · `vignette` · `warm-tint` · `soft-light` | `vignette` overlay on the base image |

Line values override the node. `dip-to-black` is a brief night-grade veil (`#07080C`, not `#000`) — art or the existing gradient placeholder stays underneath (never a stuck pure-black frame). Image errors still use `resolveAssetUrl` + the SceneArt placeholder.

## Scale lock (investor / CEO)

Player chrome and any UI copy we touch stay **bold suggestive, not adult**:

- Allowed: 半露 / wetness implication / disheveled clothing edge, close camera, warm veil + magenta mist, breathing motion.
- Forbidden: visible nipples/genitals, explicit sex acts or how-to sex prose, adult-site red/black neon (`#FF0033`, black-red chrome). No extra adult art packs.

`warm-tint` is warmVeil + magentaMist. Ken Burns peaks at **1.028 / 14s** with a small breathe. Product marketing remains a browser VN.
