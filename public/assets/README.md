# public/assets · WetBlessing

路径与夹具 `assetId` 对齐（例：`assets/scenes/ch01/n_see_both.webp`）。

**付费段别名（P-D5）：** 完整表见 `docs/ART-assetId-aliases.md`。

摘要：
- `n_pay_01_catch_mia` / `n_pay_01_catch_jade` → 均指向 `scenes/ch01/n_pay_01_catch_b.webp`（Mia 为暂复用）
- `n_pay_02_ot_mia` / `n_pay_02_ot_jade` / `n_pay_02_router` / `n_pay_02_double_empty` → 均指向 `scenes/ch01/n_pay_02_ot_a.webp`（Jade ot 为暂复用）
- 播放器只认 `assetId`，勿用 `nodeId` 拼文件名判缺图

缺图判定必须跟 assetId。
