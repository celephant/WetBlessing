# ART 进仓核对续页 · P-D5 付费段 assetId 别名

**效力：** GATE P-D5 · G2/夹具合并 PR 必带  
**夹具：** `CONTENT-ch01-free-to-firstsub.json` · `0.4.8-feel-hot`（hotter-cast-3）  
**规则：** 播放器**只认 `assetId` 路径**，不要用 `nodeId` 拼文件名。多节点可指向同一 webp。

Heat 上限：动漫 CG 擦边——**完成吻**、胸、乳沟、腿、**脚/赤足**、抱、压在床上/墙上、跨坐边缘、手按腰与大腿、颈侧呼吸、短下摆、湿衣贴身、滑肩。无生殖器、无性交静帧、无写实 photoreal。不要把 vision-forge 图进 `public/assets/`。

新绘在 `public/assets/scenes/heat/`，按 `assetId` 进仓（每人专用吻，禁止四人共用一张）：

| 文件 | 内容 |
|---|---|
| `n_heat_pin_mia.webp` | Mia 压在床上、滑肩乳沟、大腿、赤足 |
| `n_heat_sleep_legs.webp` | Mia 床沿滑肩、乳沟、裸腿、赤足 |
| `n_heat_kiss_mia.webp` | Mia 宿舍完成吻 |
| `n_heat_straddle_jade.webp` | Jade 雨墙跨坐边缘、湿短上衣、腿、赤足 |
| `n_heat_jade_cling.webp` | Jade 雨中紧抱、乳沟、腿、赤足（**离开 catch_b**） |
| `n_heat_kiss_jade.webp` | Jade 完成吻 |
| `n_heat_hug_lina.webp` | Lina 雨棚紧抱、湿衣贴胸、腿、赤足 |
| `n_heat_wet_cling.webp` | Lina 湿短上衣贴胸、短下摆大腿 |
| `n_heat_kiss_lina.webp` | Lina 完成吻 |
| `n_heat_neck_rae.webp` | Rae 门后颈侧呼吸、湿 T、腰、赤足 |
| `n_heat_door_steam.webp` | Rae 湿白 T 贴胸、髋腿、共握门把 |
| `n_heat_kiss_rae.webp` | Rae 完成吻 |
| `n_heat_kiss_vanessa.webp` | Vanessa 雨巷完成吻、滑肩乳沟、腿、赤足 |
| `n_heat_vanessa_hug.webp` | Vanessa 大衣紧抱（库存） |
| `n_heat_kiss_meet.webp` | 旧共用吻底，**不再挂到节点** |

## 1. 付费段别名表（核心）

| nodeId（夹具） | artStatus | 实际文件（assetId） | 说明 |
|---|---|---|---|
| `n_pay_01_catch_jade` | ready | `assets/scenes/heat/n_heat_jade_cling.webp` | 圆场 Jade · 湿 cling，离开 catch_b |
| `n_pay_01_catch_mia` | ready | `assets/scenes/heat/n_heat_sleep_legs.webp` | 圆场 Mia · 滑肩裸腿赤足 |
| `n_pay_01_catch_lina` | ready | `assets/scenes/heat/n_heat_wet_cling.webp` | 圆场 Lina · 湿衣贴身 |
| `n_pay_01_catch_rae` | ready | `assets/scenes/heat/n_heat_door_steam.webp` | 圆场 Rae · 湿 T 门把 |
| `n_pay_02_router` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 系统路由（玩家不可见）· 复用 ot 底 |
| `n_pay_02_ot_mia` | ready | `assets/scenes/heat/n_heat_pin_mia.webp` | 赴约 Mia 加时 · 压床 |
| `n_pay_02_ot_jade` | ready | `assets/scenes/heat/n_heat_straddle_jade.webp` | 赴约 Jade 加时 · 跨坐边缘 |
| `n_pay_02_ot_lina` | ready | `assets/scenes/heat/n_heat_hug_lina.webp` | 赴约 Lina 加时 · 紧抱 |
| `n_pay_02_ot_rae` | ready | `assets/scenes/heat/n_heat_neck_rae.webp` | 赴约 Rae 加时 · 颈侧 |
| `n_pay_02_double_empty` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 双鸽无赴约加时 · 复用 ot 氛围图 |
| `n_pay_03_vanessa` | ready | `assets/scenes/heat/n_heat_kiss_vanessa.webp` | Vanessa 完成吻 |
| `n_pay_settle` | placeholder | `assets/scenes/ch01/n_pay_settle.webp` | 结算占位 · **文件可缺** |

### 历史命名对照

| 旧/美术内部名 | 夹具 nodeId | 文件名 |
|---|---|---|
| `n_pay_01_catch_b` | 曾 → `catch_jade` | 文件仍在 `scenes/ch01/n_pay_01_catch_b.webp`，**hotter-cast-3 不再挂节点** |
| `n_pay_02_ot_a` | → `router` / `double_empty` | 仍叫 `n_pay_02_ot_a.webp` |
| `n_heat_kiss_meet` | 曾四人共用吻 | 文件保留，不再挂 `n_kiss_*` |

**禁止：** 在仓里按 `nodeId` 找 `n_pay_01_catch_mia.webp` 判缺图——该文件故意没有。

## 2. 免费段

| nodeId | artStatus | assetId |
|---|---|---|
| `n_mia_tease_auto` / `n_mia_edge_2` | ready / ready_reuse | `assets/scenes/ch01/n_mia_edge_1.webp` |
| `n_dorm_steam` / `n_pay_01_catch_rae` | ready | `assets/scenes/heat/n_heat_door_steam.webp` |
| `n_with_mia` / `n_pay_02_ot_mia` | ready | `assets/scenes/heat/n_heat_pin_mia.webp` |
| `n_with_jade` / `n_pay_02_ot_jade` | ready | `assets/scenes/heat/n_heat_straddle_jade.webp` |
| `n_with_lina` / `n_pay_02_ot_lina` | ready | `assets/scenes/heat/n_heat_hug_lina.webp` |
| `n_with_rae` / `n_pay_02_ot_rae` | ready | `assets/scenes/heat/n_heat_neck_rae.webp` |
| `n_kiss_mia` | ready | `assets/scenes/heat/n_heat_kiss_mia.webp` |
| `n_kiss_jade` | ready | `assets/scenes/heat/n_heat_kiss_jade.webp` |
| `n_kiss_lina` | ready | `assets/scenes/heat/n_heat_kiss_lina.webp` |
| `n_kiss_rae` | ready | `assets/scenes/heat/n_heat_kiss_rae.webp` |

## 3. 工程校验建议

1. 缺图判定：`fs.exists(public/` + `assetId`)`，**不要** `exists(nodeId + '.webp')`。  
2. `scenes/heat/` 与 w2/w3 一样按路径直出，不走 Ch01 stem fallback。  
3. 不要提交 `art-pack-ready/` 或 `wetblessing-src.tgz`。

## 4. 仍缺

- [ ] `n_open` / 登记桌 / settle / title 占位
- [ ] 角色设定板未改（Mia 设定板仍偏卫衣；无 Rae/Lina 设定板）

— 美术·角色一致 · P-D5 · hotter-cast-3
