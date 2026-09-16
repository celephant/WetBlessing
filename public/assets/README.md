# public/assets · WetBlessing

路径与夹具 `assetId` 对齐（例：`assets/scenes/ch01/n_see_both.webp`）。

**付费段别名（P-D5）：** 完整表见 `docs/ART-assetId-aliases.md`。

摘要（bible-wire）：
- 圣经镜头图按 scene ID：`S06a.webp`（Mia 床）· `S06b.webp`（Jade 干楼梯）· `S04.webp`（Rae 水手门）· `S06c.webp`（Lina 氯水）· `S11.webp`（Vanessa 唯一雨）· `S14.webp`（Reina 办公室周一钩，Ch01 未接线）
- Ch02 新静帧在 `scenes/ch02/`：`S13.webp` 食堂 · `S14.webp` 办公室 · `S14-lock.webp` 锁门 · `S14-abort.webp` 免费中止 · `S14-kiss.webp` 付费吻
- Ch03 闭馆夜在 `scenes/ch03/`（S18 图书馆 / S18L 泳池 / S18R 洗衣房 / S19 门缝 / S20 同空间 / S21 谣言手机）
- Ch04 名分在 `scenes/ch04/`（S22 晨 / S23 走廊 / S24 结局卡）
- Catch 墙 / 付费 Catch 挂 KEEP `ch01-catch-*.webp`，不挂旧 `n_heat_*` cling
- 吻 / OT 仍用旧 `n_heat_*`，且不得与对应 `n_with_*` / Catch 撞文件
- Jade **不再挂** `n_pay_01_catch_b.webp`
- 播放器只认 `assetId`，勿用 `nodeId` 拼文件名判缺图
- 不要把 vision-forge 写实 jpg 放进本目录
- 不要提交 `art-pack-ready/` 或 `wetblessing-src.tgz`

缺图判定必须跟 assetId。
