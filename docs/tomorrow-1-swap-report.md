# 《明天见》tomorrow.1 替换报告

**结论：运行时已切到 tomorrow.1，工程检查与真实播放器操作通过。视觉待审与未试玩体验项仍未关闭，不能当作正式发布验收。**

未提交、未推送、未部署。未建 worktree。未生成新图。未改写受保护的图片/字体原件。

工作目录确认：`/Users/zezeng/Desktop/Saas/WetBlessing`（忽略带空格的 `Saas /WetBlessing`）。`交付资料/design/proposal.json` 存在。根目录没有 `AGENTS.md` / `docs/ENGINEERING-SPEC.md` / `docs/ASSET-RESET-PLAN.md`，按任务回退到 `交付资料/reference/`。`history/` 未作现行稿。`交付资料/tools/authoring.mjs` 不是运行时生成器：读到 `storyVersion === "tomorrow.1"` 会直接抛错。

---

## 1. MANUSCRIPT 与 proposal.json

转换器 `scripts/convert-proposal.mjs` 对照 `交付资料/design/MANUSCRIPT.md` 第 3 节 83 行节点表和第 6 节逐场对白/选项。

**实质冲突：0。未停下。未用旧 Ch01/funnel/fourweek 剧情补齐。**

唯一额外处理（不是旧剧情）：`scene.mia.kiss.answer` 若在离开时立刻把 `consent.miaKiss=false`，下一节点 `scene.mia.goodnight` 的 `beatVariations`（`consent.miaKiss === false` 的慢告别句）永远匹配不上。转换器把这次清除推迟到 `scene.mia.goodnight.onCompleteEffects`，亲吻线与「今晚先不接吻」线仍能读到不同拍。Jade 池边线仍按提案在 `scene.jade.pool.stay` 结束时清许可。

---

## 2. 源与生成物

| 角色 | 路径 |
| --- | --- |
| 唯一可编辑运行时源 | `content/story.json` |
| 校验后生成发布物 | `public/assets/story.json` |
| 设计依据（禁止当第二加载源） | `交付资料/design/proposal.json` |
| 转换器 | `scripts/convert-proposal.mjs` |
| 编译器 / `npm run check` 前半 | `scripts/compile-story.mjs` |

`storyVersion = tomorrow.1`。`documentType = runtime-story`。入口 `scene.invitation`。

编译报告：

```
status: passed
nodes: 83
beats: 177
thoughts: 20
choicePoints: 8
choiceOptions: 22
variations: 11
heat: 22
paths: 192
endings: 4
originals: images 150, fonts 1, sha256-match
```

解析后源与发布物相等。跳转只来自 `next` / `choices.target` / `endingResolver`。条件拍 `beatVariations` 替换指定 index，不追加阅读拍。结局四条全落在 `scene.sunset.ending`，替换同长度拍。

玩家可见 speaker / choice 已去掉「（拟定）」「（身份待核）」等评审标记；`identityReviewStatus` / `visualReleaseStatus` / extra-arm 仍为 pending。商业、登录、支付、积分、订阅、买断、竖图自动替换全部 `false`。动作不一致配对 `asset.image.064` ↔ `asset.image.100` 为 `neverSwap`。额外前景手节点 `scene.jade.stair.kiss` / `scene.jade.stair.stay` 保持 `extraArmPending`。

首次拜访只写 `choice.firstVisit`（jade / mia / rae / vanessa），不写 `relationship.route`。路线互斥发生在 `scene.choose.relationship`（jade / mia / vanessa / self）。亲吻节点要求对应 `consent.*` + dating/couple；场景结束清临时许可。

22 张 heat 图已落到新节点（invitation、jade.towel、mia.cable、rae.badge、goodnight.hand、reina.private.answer、rae.saturday / commitment / first.kiss / kiss.answer、jade.date / pool.kiss / pool.stay / stair.kiss / stair.stay、mia.kiss.invitation / first.kiss / kiss.answer、vanessa.rain.meeting / rain.kiss / lamppost / rain.stay）。原图文件名未改，部分仍位于 `public/assets/scenes/ch01/` 等旧目录，这是原件复用，不是旧 JSON 剧情。

---

## 3. 旧剧情解绑

已从 `content/` 和 `src/content/chapters/` 移走现行加载的 Ch01–Ch04 / funnel / fourweek JSON，只读归档在 `archive/legacy/`（含 README：不是运行时源）。

运行时默认只编译 `content/story.json` @ tomorrow.1。`app/play/play-client.tsx` 忽略 `?content=`。`lib/dev-packs.ts` 不再解析 fourweek/ch02–ch04/funnel。allowlist 的 `defaultAllow` 只剩 tomorrow.1；`denyDefaultGlobs` 拒绝旧 `CONTENT-*` 包名。标题与播放器不再出现「开始入学夜」/ DEV PASS / 付费墙。

`FunnelHud` / `FunnelAuthDock` 为空组件。`PaywallOverlay.tsx` 仍留在磁盘，但 `VNPlayer` 不再挂载。`content/UI-tokens.json` 的 Night Pass SHA 仍作为样式锁文件校验，不表示付费 UI 开启。

未删除、未改写 `public/` 下图片和字体原件。

---

## 4. 存档

- 新键：`wb:tomorrow.1:save`
- 旧键保留不迁移、不清除：`wb:slice0:save` 及 funnel/ch02–ch04/fourweek 变体
- 版本不兼容：提示「不能带到《明天见》」，提供「开始新的一局」
- 回看/继续读取当时完整 `GameState`（nodeId + beatIndex + flags），不会把另一条线的约会/亲吻写回去

---

## 5. 工程检查

`package.json` 增加 `"check": "node scripts/compile-story.mjs && vitest run"`。

旧 Ch01/funnel/paywall/fourweek 测试已删。现行测试按 tomorrow.1 行为重写，无 skip：

- `tests/story-compile.test.ts`
- `tests/engine-tomorrow.test.ts`（首访不锁路线、替换不增拍、后期互斥、亲吻许可生命周期、同拍独白、四结局）
- `tests/save-isolation.test.ts`
- `tests/player-facing.test.ts`
- `tests/interaction-ui.test.ts` / `tests/ui-tokens.test.ts`（夹具改为 tomorrow.1 选项，不再用「箱子我来」/「圆场」旧稿）

**`npm run check`：7 files / 33 tests 全部通过。**  
**`npm run build`：Next.js 15.5.25 编译、lint、类型检查通过。** 路由 `/`、`/play`。

SHA-256：`content/assets.manifest.json` 中 150 张图 + 1 个字体与 `public/` 原件逐文件一致。

---

## 6. 真实播放器（Chromium，生产服务 `http://127.0.0.1:3456`）

| 检查 | 结果 |
| --- | --- |
| 标题为「明天见」，文案含 tomorrow.1 | PASS |
| 无「开始入学夜」漏斗 CTA | PASS |
| 标题静帧 `S06b.webp`（邀约 heat），竖图替换关闭 | PASS |
| `/play` `data-story-version=tomorrow.1`，入口 `scene.invitation` | PASS |
| 商业 / 竖图替换属性 `off` | PASS |
| 画面解码 1280×720，`object-fit: contain` | PASS |
| 第一拍 Jade「想见你」，无「拟定/待核」 | PASS |
| 第二拍同拍独白出现，不是第四次点击 | PASS |
| 推进后换图 | PASS |
| Escape 暂停，暂停卡「继续」恢复 | PASS |
| Enter 推进到开场 4 选项（Jade / Mia / 若伊 / Vanessa） | PASS |
| 键盘 `1` 选第一项，画面切到 `S06c.webp` | PASS |
| 390×844 手机视口仍 contain，画面盒 390×844 | PASS |
| `/play?content=funnel` 仍是 tomorrow.1 邀约，不回旧包 | PASS |
| 旧 `wb:slice0:save` + `?resume=1` 出不兼容提示；新开一局后旧存档仍在 | PASS |

截图（本机验证产物，非正式视觉验收）：`01-title` … `08-incompatible-then-new`。

---

## 7. 仍待确认（不能宣称发布验收通过）

来自 `交付资料/checks/EXPERIENCE-REVIEW.md`，本轮只把稿装进播放器，没有关闭这些项：

- Jade 参考图与金发场景组外观不同；不能用「换造型」自行解释
- Vanessa、丽娜及部分男性场景身份仍 pending
- 旧图序 65、75 额外前景手（楼梯吻）仍 pending，不能当已确认双人私密场景
- 旧图序 46/47 横竖站位不同：保留完整横图
- 旧图序 60 动作不一致：禁止自动替换（已 `neverSwap`）
- 旧图序 79/83 Mia 延续身份、80/81 匿名人物待核
- 61 条「预览相符」横竖关系仍待人工批准；64 条竖图配对全部 `enabled: false`
- Jade 个人线偏短、群像等待、手机同拍独白可读性、试玩边界等尚未用真人试玩数据关闭

`validation.json` 只证明设计图结构，不代替本次播放器完成证明。本次播放器操作覆盖标题、推进、同拍独白、四选项、暂停、键盘、手机视口、旧存档提示；没有穷举 192 条路径的人工点完。

---

## 8. 本轮明确没做

- 不启用竖图自动替换，不把 pending 标成通过
- 不恢复积分扣费、登录、订阅
- 不提交、不推送、不部署
- 不生成新图
