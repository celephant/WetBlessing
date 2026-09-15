# ART 进仓核对续页 · P-D5 付费段 assetId 别名

**效力：** GATE P-D5 · G2/夹具合并 PR 必带  
**夹具：** `CONTENT-ch01-free-to-firstsub.json` · `0.4.8-feel-hot`（hotter-cast 同版本）  
**规则：** 播放器**只认 `assetId` 路径**，不要用 `nodeId` 拼文件名。多节点可指向同一 webp。

Heat 上限：动漫 CG 擦边——**完成吻**、胸、腿、乳沟、短下摆、湿衣贴身、滑肩。无生殖器、无性交静帧、无写实 photoreal。不要把 vision-forge 图进 `public/assets/`。

新绘在 `public/assets/scenes/heat/`（仅四张进仓）：

| 文件 | 内容 |
|---|---|
| `n_heat_kiss_meet.webp` | 雨夜，嘴对上，滑肩乳沟 |
| `n_heat_sleep_legs.webp` | 宿舍床沿，滑肩、乳沟、裸腿 |
| `n_heat_wet_cling.webp` | 雨夜短上衣贴胸、短下摆大腿（Lina 向） |
| `n_heat_door_steam.webp` | 湿白 T 贴胸、髋腿、共握门把（Rae 向） |

## 1. 付费段别名表（核心）

| nodeId（夹具） | artStatus | 实际文件（assetId） | 说明 |
|---|---|---|---|
| `n_pay_01_catch_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` | 圆场 B=Jade · 湿街近景 |
| `n_pay_01_catch_mia` | ready | `assets/scenes/heat/n_heat_sleep_legs.webp` | 圆场 Mia · 滑肩裸腿新绘 |
| `n_pay_01_catch_lina` | ready | `assets/scenes/heat/n_heat_wet_cling.webp` | 圆场 Lina · 湿衣贴身 |
| `n_pay_01_catch_rae` | ready | `assets/scenes/heat/n_heat_door_steam.webp` | 圆场 Rae · 湿 T 门把 |
| `n_pay_02_router` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 系统路由（玩家不可见）· 复用 ot 底 |
| `n_pay_02_ot_mia` | ready | `assets/scenes/heat/n_heat_sleep_legs.webp` | 赴约 Mia 加时 |
| `n_pay_02_ot_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` | 赴约 Jade 加时 |
| `n_pay_02_ot_lina` | ready | `assets/scenes/heat/n_heat_wet_cling.webp` | 赴约 Lina 加时 |
| `n_pay_02_ot_rae` | ready | `assets/scenes/heat/n_heat_door_steam.webp` | 赴约 Rae 加时 |
| `n_pay_02_double_empty` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 双鸽无赴约加时 · 复用 ot 氛围图 |
| `n_pay_03_vanessa` | ready | `assets/scenes/ch01/n_pay_03_vanessa.webp` | 1:1 · 无别名 |
| `n_pay_settle` | placeholder | `assets/scenes/ch01/n_pay_settle.webp` | 结算占位 · **文件可缺** |

### 历史命名对照

| 旧/美术内部名 | 夹具 nodeId | 文件名 |
|---|---|---|
| `n_pay_01_catch_b` | → `catch_jade` | 仍叫 `n_pay_01_catch_b.webp` |
| `n_pay_02_ot_a` | → `router` / `double_empty` | 仍叫 `n_pay_02_ot_a.webp` |

**禁止：** 在仓里按 `nodeId` 找 `n_pay_01_catch_mia.webp` 判缺图——该文件故意没有。

## 2. 免费段

| nodeId | artStatus | assetId |
|---|---|---|
| `n_mia_tease_auto` / `n_mia_edge_2` | ready / ready_reuse | `assets/scenes/ch01/n_mia_edge_1.webp` |
| `n_dorm_steam` / `n_with_rae` | ready | `assets/scenes/heat/n_heat_door_steam.webp` |
| `n_with_mia` | ready | `assets/scenes/heat/n_heat_sleep_legs.webp` |
| `n_with_lina` | ready | `assets/scenes/heat/n_heat_wet_cling.webp` |
| `n_with_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` |
| `n_kiss_mia/jade/lina/rae` | ready | `assets/scenes/heat/n_heat_kiss_meet.webp` |

## 3. 工程校验建议

1. 缺图判定：`fs.exists(public/` + `assetId`)`，**不要** `exists(nodeId + '.webp')`。  
2. `scenes/heat/` 与 w2/w3 一样按路径直出，不走 Ch01 stem fallback。  
3. 不要提交 `art-pack-ready/` 或 `wetblessing-src.tgz`。

## 4. 仍缺

- [ ] 每人专用吻变体（现四人共用 kiss-meet）
- [ ] Jade 短下摆专用新绘（现仍用 catch_b）
- [ ] `n_open` / 登记桌 / settle / title 占位
- [ ] 角色设定板未改（Mia 设定板仍偏卫衣）

— 美术·角色一致 · P-D5 · hotter-cast-2
