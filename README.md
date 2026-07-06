# J人旅行神器

把密密麻麻的旅行计划，变成手机上每天一页、一眼能看的出门行动卡。

这个仓库提供 Codex / Claude Code 可用的 Agent Skill。用户先填写我们给定的 Excel 模板，再让 AI 使用本 Skill 生成一个可发布到 GitHub Pages 的手机旅行计划 app 链接。手机打开链接后，可以添加到主屏幕，出门时直接看今天要做什么、怎么走、住哪里、注意什么。

## 适合谁

- 喜欢做详细计划，但出门后不想翻飞书、腾讯文档或复杂 Excel 的 J 人。
- 想把旅行计划变成每天一页行动卡的人。
- 想用 Codex 或 Claude Code 自动生成可分享旅行页面的人。

## 安装

### Codex

安装整个仓库作为 Codex plugin，或复制 `skills/j-travel-toolkit` 到本机 Codex skills 目录。

推荐对 Codex 说：

```text
使用 J人旅行神器，帮我生成旅行计划 app。
```

### Claude Code

复制 `skills/j-travel-toolkit` 到 Claude Code 的 skills 目录，例如：

```text
~/.claude/skills/j-travel-toolkit
```

然后对 Claude Code 说：

```text
Use J人旅行神器 to generate my travel plan app from the template.
```

## 使用方式

1. 对 Codex 或 Claude Code 说：`使用 J人旅行神器，帮我生成旅行计划 app。`
2. Skill 会先给你一份固定模板。
3. 模板只有一个 `行程` sheet、一张表：日期、星期、城市、时间、行程、交通、住宿。
4. 模板里有 3 天左右示意数据，上传前记得删掉示意数据，再填成自己的真实行程。
5. 填好后上传/send back，Skill 再生成并发布旅行计划 app。

## 生成结果

- 中文移动端页面
- 底部导航：行程、贴士、交通、快捷
- 每天一页行程行动卡
- 交通页包含航班、高铁、打车、步行等
- 必备物品清单支持勾选并保存在本机
- GitHub Pages 公开链接

## 发布到 GitHub Pages

默认策略是“一次旅行一个公开 GitHub 仓库”。先在 GitHub 创建公开仓库，复制仓库 URL，再让 AI 使用这个 URL 完成生成、`git push` 和 GitHub Pages 发布。

## 隐私提醒

GitHub Pages 默认是公开网页。不要把护照号、证件号、订单号、详细房号、紧急联系人手机号等敏感信息写进表格。

## 技术说明

生成结果是一个静态网页应用，可以添加到手机主屏幕。普通用户不需要理解这部分，只需要打开链接并添加到桌面即可。
