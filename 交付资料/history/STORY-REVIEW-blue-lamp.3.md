# 剧情与配图修订记录

## 本轮结果

- 83 个节点逐场修订为 249 条对白、83 条独白；当前版本 blue-lamp.3 按主动暧昧、短句和心跳感重写，文风见 `docs/DIALOGUE-STYLE.md`。
- 150 张图片完成助手首轮预览观察，150 张原图与 1 个字体仍以原 SHA-256 校验；未修改原件或清单哈希。
- 64 组候选配对：61 组主要画面相符、2 组构图站位变化、1 组动作不一致。所有人工审核仍为 pending。
- Mia、Reina、Rae 的姓名有可读画面文字依据；同名人物在其他镜头中的身份对应仍含外观推定。绿发、金发、黑发等未确认姓名的角色使用外观称呼。

## 内容真源和校验

唯一可编辑剧情源为 `content/story.json`；`npm run story:generate` 验证后发布至 `public/assets/story.json`。发布过程不再根据文件名、目录或索引推测角色、对白与剧情。生成产物不得单独编辑。

`content/assets.manifest.json` 继续是原件资源索引。`content/assets.visual-review.json` 单独保存绑定原件哈希的助手观察，不改写清单中的 human-review pending 或 visualTags。它包含每个资源的可见事实、命名证据和每组配对的差异。

`npm run audit`、`npm run check` 和构建前检查纳入 `story:audit`：拒绝长句重复、独白重复、说话人字段冲突、未观察到的现场说话人、缺失或过期观察、动作冲突配对被启用，以及剧情源与发布产物不同步。长句以去除空白、标点和符号后不少于 12 字为准。

## 明确待人工确认

| 节点 | 横图 / 候选竖图 | 发现与处理 |
|---|---|---|
| scene.046 | asset.image.050 / asset.image.141 | 横版并排、竖版前后站位；避免依赖具体站位的对白，仍待构图批准。 |
| scene.047 | asset.image.051 / asset.image.140 | 同样有人物前后位置变化，不能据此判断人物关系。 |
| scene.060 | asset.image.064 / asset.image.100 | 横图俯身、竖图站立。保留候选索引，停止选用这张竖图，明确使用完整横图及宽幅查看。 |

首轮预览不能代替细节审核。Jade、Vanessa、Kai 参考图仍保留，但不能自动给每个相似人物冠以这些名字；Lina 没有独立参考图，绿发女生的姓名仍待确认。图中角色文字仅作姓名与身份参考，不继承旧关系和付费设定。

## 会话图片预算

本轮在临时目录生成 JPEG 预览副本，每页最多 6 组画面。横图缩至 416×260 容器、竖图至 150×260 容器，质量 65；15 页预览的 Base64 编码总量约 2.05 MB，另对 Rae 证卡补看一张细节预览。原始大 PNG 拼图没有重新载入。

后续按累计编码字节控制批次，及时将观察落盘。此预算是保守工作规则，不是已验证的接口限制，也不能保证第三方中转不再报错。

## 保留的工作边界

本轮保持节点目标与选择效果不变，只使选项文案符合画面与去向。原有分支会汇合、结局仍共享终点，不能称为独立路线已完成；跨场景时间与章节节奏也需后续整体编排。未实现 heat 前置、播放器、音效、收费或存档迁移。

## 场景核对索引

| 节点 | 画面 | 当前竖图 | 标题 |
|---|---|---|
| scene.001 | asset.image.005 | asset.image.092 | 先抓住我的手 |
| scene.002 | asset.image.006 | asset.image.093 | 只剩我们和水声 |
| scene.003 | asset.image.007 | asset.image.094 | 门口的人比消息好看 |
| scene.004 | asset.image.008 | asset.image.095 | 回头就是邀请 |
| scene.005 | asset.image.009 | asset.image.102 | 目光先选了方向 |
| scene.006 | asset.image.010 | asset.image.105 | 这一阶有点近 |
| scene.007 | asset.image.011 | asset.image.091 | 只说给你听 |
| scene.008 | asset.image.012 | asset.image.088 | 谁先移开目光 |
| scene.009 | asset.image.013 | 完整横图 | 捡起来的开场白 |
| scene.010 | asset.image.014 | asset.image.103 | 先想起谁 |
| scene.011 | asset.image.015 | 完整横图 | 名字写在这里 |
| scene.012 | asset.image.016 | asset.image.110 | 电梯再慢一点 |
| scene.013 | asset.image.017 | asset.image.115 | 手比话先到了 |
| scene.014 | asset.image.018 | 完整横图 | 你看人的样子 |
| scene.015 | asset.image.019 | 完整横图 | 笑意还没收回去 |
| scene.016 | asset.image.020 | 完整横图 | 路灯替你泄密 |
| scene.017 | asset.image.021 | asset.image.101 | 下一句要当面说 |
| scene.018 | asset.image.022 | asset.image.090 | 两边都不肯放 |
| scene.019 | asset.image.023 | asset.image.089 | 照片里的火花 |
| scene.020 | asset.image.024 | asset.image.101 | 那一秒舍不得删 |
| scene.021 | asset.image.025 | asset.image.117 | 这次直接一点 |
| scene.022 | asset.image.026 | asset.image.116 | 饭还是我好看 |
| scene.023 | asset.image.027 | asset.image.119 | 抬头看我 |
| scene.024 | asset.image.028 | asset.image.120 | 吻后的第一句话 |
| scene.025 | asset.image.029 | asset.image.121 | 不是送客的回头 |
| scene.026 | asset.image.030 | asset.image.118 | 照片以外的答案 |
| scene.027 | asset.image.031 | asset.image.122 | 把声音留小一点 |
| scene.028 | asset.image.032 | asset.image.123 | 手机放下，看我 |
| scene.029 | asset.image.033 | asset.image.125 | 手不要急着收 |
| scene.030 | asset.image.034 | asset.image.124 | 递过来的温柔 |
| scene.031 | asset.image.035 | asset.image.126 | 你比机器有耐心 |
| scene.032 | asset.image.036 | asset.image.127 | 故意慢下来的脚步 |
| scene.033 | asset.image.037 | asset.image.129 | 听见你还在 |
| scene.034 | asset.image.038 | asset.image.128 | 别急着替我关门 |
| scene.035 | asset.image.039 | asset.image.130 | 门缝也挡不住笑 |
| scene.036 | asset.image.040 | asset.image.131 | 这个位置留给你 |
| scene.037 | asset.image.041 | asset.image.132 | 再坐到水光暗一点 |
| scene.038 | asset.image.042 | asset.image.133 | 先叫一声我的名字 |
| scene.039 | asset.image.043 | asset.image.134 | 你等的是哪一边 |
| scene.040 | asset.image.044 | asset.image.135 | 一句话删了三遍 |
| scene.041 | asset.image.045 | asset.image.136 | 输了要再来一局 |
| scene.042 | asset.image.046 | asset.image.137 | 白天也敢看我吗 |
| scene.043 | asset.image.047 | asset.image.138 | 不是只来帮忙 |
| scene.044 | asset.image.048 | asset.image.139 | 白天见也要打招呼 |
| scene.045 | asset.image.049 | asset.image.142 | 藏不住的目的地 |
| scene.046 | asset.image.050 | asset.image.141 | 当着面也要回答 |
| scene.047 | asset.image.051 | asset.image.140 | 我也在找你 |
| scene.048 | asset.image.052 | asset.image.149 | 去赴一个约 |
| scene.049 | asset.image.053 | asset.image.143 | 合照里的小心思 |
| scene.050 | asset.image.054 | asset.image.144 | 牵住就慢慢走 |
| scene.051 | asset.image.055 | asset.image.145 | 这次换我找你 |
| scene.052 | asset.image.056 | asset.image.147 | 再见说得太快了 |
| scene.053 | asset.image.057 | asset.image.146 | 照片留下，你别急 |
| scene.054 | asset.image.058 | asset.image.150 | 黄昏里还在回味 |
| scene.055 | asset.image.059 | asset.image.148 | 屋檐下留了位置 |
| scene.056 | asset.image.060 | asset.image.112 | 回头等你追上 |
| scene.057 | asset.image.061 | asset.image.109 | 今天别只顾纸箱 |
| scene.058 | asset.image.062 | asset.image.104 | 手机可以还，目光呢 |
| scene.059 | asset.image.063 | asset.image.107 | 多留一句话 |
| scene.060 | asset.image.064 | 完整横图 | 雨大，说给我听 |
| scene.061 | asset.image.065 | 完整横图 | 从容也会露出破绽 |
| scene.062 | asset.image.066 | 完整横图 | 叫名字，比看证件好 |
| scene.063 | asset.image.067 | asset.image.097 | 谁先靠近都一样 |
| scene.064 | asset.image.068 | 完整横图 | 这次不必借力 |
| scene.065 | asset.image.069 | asset.image.106 | 玩笑后面是真话 |
| scene.066 | asset.image.070 | asset.image.108 | 不急着结束这一刻 |
| scene.067 | asset.image.071 | 完整横图 | 逗你，也喜欢你 |
| scene.068 | asset.image.072 | asset.image.111 | 喜欢不用再藏 |
| scene.069 | asset.image.073 | asset.image.114 | 吻之后也要说清楚 |
| scene.070 | asset.image.074 | 完整横图 | 这回不用藏在雨里 |
| scene.071 | asset.image.075 | asset.image.113 | 靠近一点再问 |
| scene.072 | asset.image.076 | asset.image.099 | 明天接着心动 |
| scene.073 | asset.image.077 | asset.image.098 | 这句只对你说 |
| scene.074 | asset.image.078 | 完整横图 | 消息没有你会逗人 |
| scene.075 | asset.image.079 | asset.image.096 | 笨拙也有人喜欢 |
| scene.076 | asset.image.080 | 完整横图 | 再抱一会儿 |
| scene.077 | asset.image.081 | 完整横图 | 泳池关了，邀约没有 |
| scene.078 | asset.image.082 | 完整横图 | 把最后一句留给你 |
| scene.079 | asset.image.083 | 完整横图 | 门开了两次 |
| scene.080 | asset.image.084 | 完整横图 | 门边留住的一分钟 |
| scene.081 | asset.image.085 | 完整横图 | 回头才能听见 |
| scene.082 | asset.image.086 | 完整横图 | 比消息先亮的笑 |
| scene.083 | asset.image.087 | 完整横图 | 早晨也想看见你 |
