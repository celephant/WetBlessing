# ART 进仓核对续页 · P-D5 付费段 assetId 别名

**效力：** GATE P-D5 · G2/夹具合并 PR 必带  
**夹具：** `CONTENT-ch01-free-to-firstsub.json` · `0.4.8-feel-hot`（bible-wire S01–S08）  
**规则：** 播放器**只认 `assetId` 路径**，不要用 `nodeId` 拼文件名。同一张静帧不得同时挂 `n_with_*` / catch / OT。

Heat 上限：动漫 CG 擦边——完成吻、胸、乳沟、腿、脚/赤足、抱、压床、干砖楼梯、颈侧、黑丝办公室。水手领/JK 仅为 **18+** 大学衣服（Rae）。老师 Reina **29** 允许。无生殖器、无性交静帧、无写实 photoreal。不要把 vision-forge 图进 `public/assets/`。

圣经第一波镜头图按 **scene assetId** 进 `public/assets/scenes/heat/`（文件名 = 圣经 ID，不是 nodeId）：

| assetId | 圣经 | 挂到 |
|---|---|---|
| `S06a.webp` | Mia 床压制 | `n_with_mia` |
| `S06b.webp` | Jade 干楼梯 | `n_with_jade` |
| `S04.webp` | Rae 水手门缝 | `n_dorm_steam` |
| `S06c.webp` | Lina 氯水跳台 | `n_with_lina` |
| `S11.webp` | Vanessa **唯一雨** | `n_pay_03_vanessa` |
| `S14.webp` | Reina 教員室 | **Ch02 only — not wired on Ch01** |

旧 heat 库存仍给 **吻 / catch / OT** 用，且不得与上表 `n_with_*` 撞文件：

| 文件 | 内容 |
|---|---|
| `n_heat_pin_mia.webp` | Mia OT 压床（不复用 S06a） |
| `n_heat_sleep_legs.webp` | Mia catch 床沿 |
| `n_heat_kiss_mia.webp` | Mia 宿舍完成吻 |
| `n_heat_straddle_jade.webp` | Jade OT 干砖跨坐（不复用 S06b；离开 catch_b） |
| `n_heat_jade_cling.webp` | Jade catch |
| `n_heat_kiss_jade.webp` | Jade 完成吻 |
| `n_heat_hug_lina.webp` | Lina OT 紧抱（不复用 S06c） |
| `n_heat_wet_cling.webp` | Lina catch |
| `n_heat_kiss_lina.webp` | Lina 完成吻 |
| `n_heat_neck_rae.webp` | Rae 空楼道颈侧 `n_with_rae` |
| `n_heat_door_steam.webp` | Rae catch（不复用 S04） |
| `n_heat_kiss_rae.webp` | Rae 完成吻（不复用 OT） |
| `n_heat_ot_rae.webp` | Rae OT 关门吻 |
| `n_heat_kiss_vanessa.webp` | 旧雨吻库存，**不再挂节点**（现用 S11） |
| `n_heat_vanessa_hug.webp` | Vanessa 大衣紧抱（库存） |
| `n_heat_kiss_meet.webp` | 旧共用吻底，**不再挂到节点** |

## 1. 付费段别名表（核心）

| nodeId（夹具） | artStatus | 实际文件（assetId） | 说明 |
|---|---|---|---|
| `n_pay_01_catch_jade` | ready | `assets/scenes/heat/n_heat_jade_cling.webp` | 圆场 Jade，离开 catch_b；不复用 S06b |
| `n_pay_01_catch_mia` | ready | `assets/scenes/heat/n_heat_sleep_legs.webp` | 圆场 Mia；不复用 S06a |
| `n_pay_01_catch_lina` | ready | `assets/scenes/heat/n_heat_wet_cling.webp` | 圆场 Lina；不复用 S06c |
| `n_pay_01_catch_rae` | ready | `assets/scenes/heat/n_heat_door_steam.webp` | 圆场 Rae；不复用 S04 |
| `n_pay_02_router` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 系统路由（玩家不可见）· 复用 ot 底 |
| `n_pay_02_ot_mia` | ready | `assets/scenes/heat/n_heat_pin_mia.webp` | 赴约 Mia 加时 · 旧压床 |
| `n_pay_02_ot_jade` | ready | `assets/scenes/heat/n_heat_straddle_jade.webp` | 赴约 Jade 加时 · 旧跨坐 |
| `n_pay_02_ot_lina` | ready | `assets/scenes/heat/n_heat_hug_lina.webp` | 赴约 Lina 加时 · 紧抱 |
| `n_pay_02_ot_rae` | ready | `assets/scenes/heat/n_heat_ot_rae.webp` | 赴约 Rae 加时 · 独立 OT，不复用免费吻 |
| `n_pay_02_double_empty` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 双鸽 · 空走廊 |
| `n_pay_03_vanessa` | ready | `assets/scenes/heat/S11.webp` | Vanessa 唯一雨 |
| `n_pay_settle` | ready | `assets/scenes/ch01/n_pay_settle.webp` | S12 空走廊结算 |

### 历史命名对照

| 旧/美术内部名 | 夹具 nodeId | 文件名 |
|---|---|---|
| `n_pay_01_catch_b` | 曾 → `catch_jade` | 文件仍在 `scenes/ch01/n_pay_01_catch_b.webp`，**不再挂节点** |
| `n_pay_02_ot_a` | → `router` / `double_empty` | 仍叫 `n_pay_02_ot_a.webp` |
| `n_heat_kiss_meet` | 曾四人共用吻 | 文件保留，不再挂 `n_kiss_*` |
| `n_heat_kiss_vanessa` | 曾 Vanessa 吻 | 文件保留，节点改挂 `S11.webp` |

**禁止：** 在仓里按 `nodeId` 找 `n_pay_01_catch_mia.webp` 判缺图——该文件故意没有。

## 2. 免费段

| nodeId | artStatus | assetId |
|---|---|---|
| `n_open` | ready | `assets/scenes/ch01/n_open.webp` |
| `n_see_both` | ready | `assets/scenes/ch01/n_see_both.webp` |
| `n_jade_desk` | ready | `assets/scenes/ch01/n_jade_desk.webp` |
| `n_dodge_corridor` | ready | `assets/scenes/ch01/n_dodge_corridor.webp` |
| `n_mia_edge_1` / `n_mia_edge_2` | ready | `assets/scenes/ch01/n_mia_edge_1.webp` |
| `n_dorm_steam` | ready | `assets/scenes/heat/S04.webp` |
| `n_with_mia` | ready | `assets/scenes/heat/S06a.webp` |
| `n_with_jade` | ready | `assets/scenes/heat/S06b.webp` |
| `n_with_lina` | ready | `assets/scenes/heat/S06c.webp` |
| `n_with_rae` | ready | `assets/scenes/heat/n_heat_neck_rae.webp` |
| `n_kiss_mia` | ready | `assets/scenes/heat/n_heat_kiss_mia.webp` |
| `n_kiss_jade` | ready | `assets/scenes/heat/n_heat_kiss_jade.webp` |
| `n_kiss_lina` | ready | `assets/scenes/heat/n_heat_kiss_lina.webp` |
| `n_kiss_rae` | ready | `assets/scenes/heat/n_heat_kiss_rae.webp` |
| `n_sms_auto` | ready | `assets/scenes/ch01/n_sms_auto.webp` |
| `n_ch01_first_sub` | ready | `assets/scenes/ch01/n_ch01_first_sub.webp` |

S14 / `n_reina_monday` is **not** on the Ch01 graph. Mail is dry text on `n_sms_auto`.

## 2b. Ch02（DEV `/play?content=ch02`）

新文件在 `public/assets/scenes/ch02/`，**不改** `scenes/ch01`。直出路径，不走 Ch01 stem fallback。

| nodeId | assetId |
|---|---|
| `n_ch02_open` / `n_s13_*` / `n_s13_after` | `assets/scenes/ch02/S13.webp` |
| `n_s14_office` / `n_s14_silk` / `n_s14_wall` | `assets/scenes/ch02/S14.webp` |
| `n_s14_lock` | `assets/scenes/ch02/S14-lock.webp` |
| `n_s14_abort` / `n_ch02_settle` | `assets/scenes/ch02/S14-abort.webp` |
| `n_s14_kiss` | `assets/scenes/ch02/S14-kiss.webp` |

## 3. 工程校验建议

1. 缺图判定：`fs.exists(public/` + `assetId`)`，**不要** `exists(nodeId + '.webp')`。  
2. `scenes/heat/`、`scenes/ch02/` 与 w2/w3 一样按路径直出，不走 Ch01 stem fallback。  
3. 不要提交 `art-pack-ready/` 或 `wetblessing-src.tgz`。

## 4. 仍缺

- [ ] `n_open` / 登记桌 / settle / title 占位
- [ ] S07 拼贴静帧、S06d 颈侧新绘、S09/S10 专用 OT
- [ ] 角色设定板未改（Mia 设定板仍偏卫衣；无 Rae/Lina/Reina 设定板）

— 美术·角色一致 · P-D5 · bible-wire
