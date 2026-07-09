# J人旅行神器

把一张旅行表，变成手机上随手看的旅行计划 app。

它适合那种很会做计划的 J 人：出发前把行程排得很细，出门后却不想再打开飞书、腾讯文档或 Excel 翻密密麻麻的内容。你只需要填写一张极简模板，AI 会帮你生成一个可以发布到 GitHub Pages 的手机网页 app。手机打开链接后，可以添加到主屏幕，像独立 app 一样随时查看今天要干啥、怎么走、住哪里、有哪些常用入口。

## 长什么样

| 行程 | 交通 | 快捷 |
| --- | --- | --- |
| ![行程页](docs/screenshots/01-itinerary.png) | ![交通页](docs/screenshots/02-transport.png) | ![快捷页](docs/screenshots/03-links.png) |

![动图演示](docs/demo/j-travel-demo.gif)

## 核心想法

- 用户只填核心行程，不需要设计复杂 Excel。
- 模板只有一个 `行程` sheet，一张表。
- AI 负责补齐常用贴士和链接，比如 Google Maps、Klook 搜索、天气、汇率等。
- 生成结果是中文移动端 app，底部导航包含：`行程`、`贴士`、`交通`、`快捷`。
- 最终交付应该是 GitHub Pages 公网链接，不是本地预览地址。

## 模板下载

模板在仓库里：

[下载 J人旅行神器模板](skills/j-travel-toolkit/assets/j-travel-template.xlsx)

模板字段：

| 日期 | 星期 | 城市 | 时间 | 行程 | 交通 | 住宿 |
| --- | --- | --- | --- | --- | --- | --- |

模板里有 3 天左右示意数据。上传前记得删掉示意数据，再填自己的真实行程。

## 安装

### Codex

在 Codex 里安装这个 GitHub skill：

```bash
python3 ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo Iceeeeeeey/j-travel-toolkit \
  --path skills/j-travel-toolkit
```

安装后重启 Codex 或开一个新会话，然后说：

```text
使用 J人旅行神器，帮我生成旅行计划 app。
```

### Claude Code

把 `skills/j-travel-toolkit` 复制到 Claude Code 的 skills 目录，例如：

```text
~/.claude/skills/j-travel-toolkit
```

然后说：

```text
使用 J人旅行神器，帮我生成旅行计划 app。
```

## 使用流程

1. 说：`使用 J人旅行神器，帮我生成旅行计划 app。`
2. Skill 会先给你一份固定模板。
3. 按模板填写核心行程。
4. 上传填好的 Excel。
5. AI 补齐贴士和常用链接。
6. Skill 生成 app。
7. 按提示在 GitHub 新建一个空的 Public 仓库，把仓库 URL 发给 AI。
8. Skill 发布到 GitHub Pages。
9. 手机打开公开链接，添加到主屏幕。

## 发布到 GitHub

发布公网链接需要一个空的 GitHub 公开仓库。最简单的方式：

1. 打开 [https://github.com/new](https://github.com/new)。
2. Repository name 填一个旅行名，比如 `rome-trip-2026`。
3. 选择 `Public`。
4. 不要勾选 README、`.gitignore` 或 license。
5. 点击 `Create repository`。
6. 把仓库 URL 发给 AI，例如：

```text
https://github.com/<你的用户名>/<仓库名>.git
```

最终链接类似：

```text
https://<github-user>.github.io/<trip-repo>/
```

## 隐私提醒

GitHub Pages 默认是公开网页。不要把护照号、证件号、订单号、详细房号、紧急联系人手机号、支付信息等敏感内容写进模板。

## 本地开发

```bash
npm run sample
npm run build:sample
```

Skill 生成器入口：

```bash
node skills/j-travel-toolkit/scripts/j-travel-toolkit.mjs create --excel trip.xlsx --out ./my-trip-app
node skills/j-travel-toolkit/scripts/j-travel-toolkit.mjs publish --site ./my-trip-app --repo-url https://github.com/<user>/<repo>.git
```
