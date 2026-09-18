# WetBlessing 交付资料

这里集中保存本轮需要长期保留的设计稿、剧情结构检查、视觉观察、预览图与 Codex 故障诊断。先读本文件，再看最新设计稿。无需依赖临时目录。

## 阅读入口

| 文件 | 用途与状态 |
| --- | --- |
| [完整剧情设计稿](design/MANUSCRIPT.md) | 最新《明天见》tomorrow.1：总纲、人物、83 个配图节点、完整对白、选项、结局及商业节点案例。 |
| [结构化剧情提案](design/proposal.json) | 最新设计的 JSON 表达，明确为非运行时提案；未接入播放器。 |
| [设计结构检查结果](design/validation.json) | 83 节点、177 阅读拍、8 处选择、192 种选择组合、4 结局等自动检查的原始结果。 |
| [体验与待核验清单](checks/EXPERIENCE-REVIEW.md) | 区分结构检查、设计层面判断、人工视觉审核和未执行的真实试玩。 |
| [交付与资源完整性报告](checks/PACKAGE-INTEGRITY.json) | 归档时资源审计、逐文件 SHA-256 和文件数量；不等同于游戏体验测试。 |
| [逐图视觉观察快照](assets/visual-review.snapshot.json) | 150 张图片的助手观察、命名证据与 64 条横竖候选配对；人工批准仍待完成。 |
| [原件清单快照](assets/manifest.snapshot.json) | 稳定资源 ID、路径、原件哈希及候选配对；用于离线核对。 |
| [小尺寸预览索引](assets/previews/index.json) | 15 页 JPEG 预览与资源编号；同目录另有 Rae 证卡局部预览。 |
| [Codex 接口报错诊断](diagnostics/CODEX-ERROR-DIAGNOSIS.md) | 两次 invalid JSON body 的证据、疑似原因及规避方式；并非已证实的服务端根因。 |

## 辅助材料

- `history/`：blue-lamp.3 阶段的剧情核对与台词规范，只是历史阶段记录。其心形符号、节点排列和旧路线说明不覆盖最新设计。
- `reference/`：归档时的工程规范、资产重置计划与基本交互约定快照。后续工程工作仍以项目 `docs/` 内最新版本为准。
- `tools/authoring.mjs`：生成设计稿与检查结果的可复用脚本，已改为相对项目位置，不再写入临时目录。

## 如何继续工作

1. 从 `design/MANUSCRIPT.md` 评审故事与商业案例，从 `checks/EXPERIENCE-REVIEW.md` 处理待核验问题。
2. 视觉核对使用 `assets/previews/` 的小图；需要细节时按原件清单定位原图，不重新加载旧的大 PNG 拼图。
3. 本目录是设计交付与证据归档，不是第二份运行时内容源。项目 `content/story.json` 仍是唯一可编辑运行剧情源，`content/assets.manifest.json` 仍是当前资源索引；此处 `.snapshot.json` 不会自动同步。
4. 当前脚本读取项目现有 blue-lamp.3 的节点映射、资源清单和视觉观察。若这些源文件已改变，先核对版本，不能直接用旧设计覆盖新工作。

在项目根目录运行 `node 交付资料/tools/authoring.mjs` 只执行检查并打印结果，不覆盖任何文件。`--patch` 只输出更新 `design/` 三个文件的补丁，需审阅后再通过补丁工具应用；它不是自动发布命令。

将本目录放在项目根目录，是为了避免把文档混入 `public/assets/` 后触发“未登记资源”校验。图片与字体原件没有搬动、复制到这里或重新编码；这里的 JPEG 只是之前已生成的核验预览副本。

旧临时副本不是后续工作入口。原始失败会话、密钥和账户配置不属于本交付资料。
