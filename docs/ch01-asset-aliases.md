# Ch01 paid-segment asset aliases

Art is resolved from each node's `assetId` field. Do not look up
`public/assets/scenes/ch01/${nodeId}.webp` — several paid beats reuse a
shared file, so a missing `${nodeId}.webp` is not a missing asset.

Source: `content/CONTENT-ch01-free-to-firstsub.json` (0.4.6-midboard).

## Pay wall → settle

| nodeId | assetId (actual file) |
| --- | --- |
| `n_pay_01_catch_mia` | `assets/scenes/ch01/n_pay_01_catch_b.webp` |
| `n_pay_01_catch_jade` | `assets/scenes/ch01/n_pay_01_catch_b.webp` |
| `n_pay_02_router` | `assets/scenes/ch01/n_pay_02_ot_a.webp` |
| `n_pay_02_ot_mia` | `assets/scenes/ch01/n_pay_02_ot_a.webp` |
| `n_pay_02_ot_jade` | `assets/scenes/ch01/n_pay_02_ot_a.webp` |
| `n_pay_02_double_empty` | `assets/scenes/ch01/n_pay_02_ot_a.webp` |

`n_pay_03_vanessa` uses a matching filename. `n_pay_settle` is a placeholder path.

## Other reuses (same rule)

| nodeId | assetId |
| --- | --- |
| `n_mia_tease_auto` | `assets/scenes/ch01/n_mia_edge_1.webp` |
| `n_with_mia` | `assets/scenes/ch01/n_with_a.webp` |
| `n_with_jade` | `assets/scenes/ch01/n_with_a.webp` |
