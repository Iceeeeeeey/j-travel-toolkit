# J人旅行神器

把密密麻麻的旅行计划，变成手机上每天一页、一眼能看的出门行动卡。

这个仓库提供 Codex / Claude Code 可用的 Agent Skill。用户填写 Excel 行程表后，让 AI 使用本 Skill 生成一个可发布到 GitHub Pages 的手机旅行助手链接。手机打开链接后，可以添加到主屏幕，出门时直接看今天要做什么、怎么走、住哪里、注意什么。

## 适合谁

- 喜欢做详细计划，但出门后不想翻飞书、腾讯文档或复杂 Excel 的 J 人。
- 想把旅行计划变成每天一页行动卡的人。
- 想用 Codex 或 Claude Code 自动生成可分享旅行页面的人。

## 安装

### Codex

安装整个仓库作为 Codex plugin，或复制 `skills/j-travel-toolkit` 到本机 Codex skills 目录。

推荐对 Codex 说：

```text
使用 J人旅行神器，根据这个 Excel 生成我的旅行行动卡链接。
```

### Claude Code

复制 `skills/j-travel-toolkit` 到 Claude Code 的 skills 目录，例如：

```text
~/.claude/skills/j-travel-toolkit
```

然后对 Claude Code 说：

```text
Use J人旅行神器 to turn this Excel into a phone-friendly travel action-card link.
```

## 使用方式

1. 复制 `skills/j-travel-toolkit/assets/j-travel-template.xlsx`。
2. 至少填写 `行程` sheet：`日期 / 星期 / 城市 / 时间 / 行程`。
3. 把 Excel 发给 Codex 或 Claude Code。
4. 让 AI 使用本 Skill 生成并发布旅行行动卡。

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
