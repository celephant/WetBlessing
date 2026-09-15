# ART 进仓核对续页 · P-D5 付费段 assetId 别名

**效力：** GATE P-D5 · G2/夹具合并 PR 必带  
**夹具：** `CONTENT-ch01-free-to-firstsub.json` · `0.4.8-feel-hot`（hotter-cast 同版本）  
**规则：** 播放器**只认 `assetId` 路径**，不要用 `nodeId` 拼文件名。多节点可指向同一 webp。

Heat cluster（W2–W3 + Jade catch）是本推的擦边上限：吻/湿/滑肩。无生殖器、无性交静帧。不要把 vision-forge 写实图进 `public/assets/`。

## 1. 付费段别名表（核心）

| nodeId（夹具） | artStatus | 实际文件（assetId） | 说明 |
|---|---|---|---|
| `n_pay_01_catch_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` | 圆场 B=Jade · 湿街近景 |
| `n_pay_01_catch_mia` | ready | `assets/scenes/w3/n_w3_sleepover_edge.webp` | 圆场 B=Mia · **改挂**滑肩睡袍感；待专用 Mia 变体 |
| `n_pay_01_catch_lina` | ready | `assets/scenes/w2/n_w2_almost_kiss.webp` | 圆场 Lina · 雨吻原型 |
| `n_pay_01_catch_rae` | ready | `assets/scenes/w3/n_w3_door_lock_hand.webp` | 圆场 Rae · 门把近身 |
| `n_pay_02_router` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 系统路由（玩家不可见）· 复用 ot 底 |
| `n_pay_02_ot_mia` | ready | `assets/scenes/w3/n_w3_sleepover_edge.webp` | 赴约 A=Mia 加时 |
| `n_pay_02_ot_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` | 赴约 A=Jade 加时 · **改挂** Jade 真图，不再复用 Mia 沙发 |
| `n_pay_02_ot_lina` | ready | `assets/scenes/w3/n_w3_sleepover_edge.webp` | 赴约 Lina 加时 · 近身湿衣原型 |
| `n_pay_02_ot_rae` | ready | `assets/scenes/w3/n_w3_door_lock_hand.webp` | 赴约 Rae 加时 |
| `n_pay_02_double_empty` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 双鸽无赴约加时 · 复用 ot 氛围图 |
| `n_pay_03_vanessa` | ready | `assets/scenes/ch01/n_pay_03_vanessa.webp` | 1:1 · 无别名 |
| `n_pay_settle` | placeholder | `assets/scenes/ch01/n_pay_settle.webp` | 结算占位 · **文件可缺** |

### 历史命名对照

| 旧/美术内部名 | 夹具 nodeId | 文件名 |
|---|---|---|
| `n_pay_01_catch_b` | → `catch_jade`（Mia 已改挂 sleepover） | 仍叫 `n_pay_01_catch_b.webp` |
| `n_pay_02_ot_a` | → `router` / `double_empty` | 仍叫 `n_pay_02_ot_a.webp` |

**禁止：** 在仓里按 `nodeId` 找 `n_pay_01_catch_mia.webp` 判缺图——该文件故意没有。

## 2. 免费段相关复用

| nodeId | artStatus | assetId |
|---|---|---|
| `n_mia_tease_auto` | ready | `assets/scenes/ch01/n_mia_edge_1.webp`（复用） |
| `n_mia_edge_2` | ready_reuse | `assets/scenes/ch01/n_mia_edge_1.webp` |
| `n_dorm_steam` / `n_with_rae` | ready | `assets/scenes/w3/n_w3_door_lock_hand.webp` |
| `n_with_mia` / `n_with_lina` | ready | `assets/scenes/w3/n_w3_sleepover_edge.webp` |
| `n_with_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` |
| `n_kiss_mia/jade/lina/rae` | ready | `assets/scenes/w2/n_w2_almost_kiss.webp` |

## 3. 工程校验建议

1. 缺图判定：`fs.exists(public/` + `assetId`)`，**不要** `exists(nodeId + '.webp')`。  
2. `artStatus` 含 `ready_reuse_pending_*` / `ready_reuse` = 可播 + 记债。  
3. 真变体落地后：新文件 + 改夹具 `assetId`/`artStatus`→`ready`，再升版。不要提交 `art-pack-ready/`。

## 4. 待补变体（不挡本推）

- [ ] 完成吻 CG（现只有 almost_kiss）
- [ ] Mia 滑肩专用图（现复用 sleepover_edge；她仍常穿卫衣）
- [ ] Lina 泳池湿衣专用图
- [ ] Rae 蒸汽楼道专用图
- [ ] 湿衣贴身 / 睡袍变体（无生殖器）

— 美术·角色一致 · P-D5 · hotter-cast
