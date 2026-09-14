# ART 进仓核对续页 · P-D5 付费段 assetId 别名

**效力：** GATE P-D5 · G2/夹具合并 PR 必带  
**夹具：** `CONTENT-ch01-free-to-firstsub.json` · `0.4.8-feel-hot`  
**规则：** 播放器**只认 `assetId` 路径**，不要用 `nodeId` 拼文件名。多节点可指向同一 webp。

## 1. 付费段别名表（核心）

| nodeId（夹具） | artStatus | 实际文件（assetId） | 说明 |
|---|---|---|---|
| `n_pay_01_catch_jade` | ready | `assets/scenes/ch01/n_pay_01_catch_b.webp` | 圆场 B=Jade · **默认海报向真图** |
| `n_pay_01_catch_mia` | ready_reuse_pending_mia_variant | `assets/scenes/ch01/n_pay_01_catch_b.webp` | 圆场 B=Mia · **暂复用 Jade 底图**；待 `n_pay_01_catch_mia.webp` |
| `n_pay_02_router` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 系统路由（玩家不可见）· 复用 ot 底 |
| `n_pay_02_ot_mia` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 赴约 A=Mia 加时 · **默认真图** |
| `n_pay_02_ot_jade` | ready_reuse_pending_jade_ot_variant | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 赴约 A=Jade 加时 · **暂复用 Mia 向 ot**；待变体 |
| `n_pay_02_double_empty` | ready | `assets/scenes/ch01/n_pay_02_ot_a.webp` | 双鸽无赴约加时 · 复用 ot 氛围图 |
| `n_pay_03_vanessa` | ready | `assets/scenes/ch01/n_pay_03_vanessa.webp` | 1:1 · 无别名 |
| `n_pay_settle` | placeholder | `assets/scenes/ch01/n_pay_settle.webp` | 结算占位 · **文件可缺** |

### 历史命名对照

| 旧/美术内部名 | 夹具 nodeId | 文件名 |
|---|---|---|
| `n_pay_01_catch_b` | → `catch_jade` / `catch_mia` | 仍叫 `n_pay_01_catch_b.webp` |
| `n_pay_02_ot_a` | → `ot_mia` / `ot_jade` / `router` / `double_empty` | 仍叫 `n_pay_02_ot_a.webp` |

**禁止：** 在仓里按 `nodeId` 找 `n_pay_01_catch_mia.webp` 判缺图——初级版故意没有该文件。

## 2. 免费段相关复用

| nodeId | artStatus | assetId |
|---|---|---|
| `n_mia_tease_auto` | ready | `assets/scenes/ch01/n_mia_edge_1.webp`（复用） |
| `n_with_mia` / `n_with_jade` | placeholder | `assets/scenes/ch01/n_with_a.webp`（共用占位名） |

## 3. 工程校验建议

1. 缺图判定：`fs.exists(public/` + `assetId`)`，**不要** `exists(nodeId + '.webp')`。  
2. `artStatus` 含 `ready_reuse_pending_*` = 可播 + 记债，不算阻塞 G2。  
3. 真变体落地后：新文件 + 改夹具 `assetId`/`artStatus`→`ready`，再升版。

## 4. 待补变体（不挡 G2）

- [ ] `n_pay_01_catch_mia.webp`  
- [ ] `n_pay_02_ot_jade.webp`  
- [ ] `n_with_a` 拆 Mia/Jade 专用图（可选）

— 美术·角色一致 · P-D5
