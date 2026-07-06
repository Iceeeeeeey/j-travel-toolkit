---
name: j-travel-toolkit
description: "Generate a Chinese mobile travel plan app from the bundled J人旅行神器 Excel template and publish it to GitHub Pages. Use when users ask for J人旅行神器, J人旅行, 旅行计划app, 旅行计划小程序, 旅行行动卡, 帮我生成旅行计划app, converting a filled travel template into a phone-friendly daily travel assistant, or making a mobile home-screen travel app link."
---

# J人旅行神器

Turn the bundled travel planning template into a mobile-first travel plan app and publish it to GitHub Pages.

## What To Build

Create a phone-friendly Chinese travel assistant for J-type planners:

- Replace dense Feishu/Tencent Docs/Excel reading with one clear daily action card.
- Always use the bundled Excel template as the input contract. It should be one sheet named `行程` with one table only.
- Keep the user-facing template lightweight: core itinerary, transport, and accommodation in one table.
- Use bottom navigation: `行程`, `贴士`, `交通`, `快捷`.
- Use `交通`, not `航班`, because it includes flights, trains, taxis, walking, ferries, and transfers.
- Keep the app Chinese-only.
- Keep map support as external links only. Do not build an embedded map component.
- Remove "已预约" as a required template column. If the user writes notes such as `已预约`, treat it as plain activity detail.
- Prefer the mature Europe-trip visual style: warm travel palette, rounded mobile cards, horizontal day selector, timeline activities, transport cards, packing checklist.

## Workflow

1. On every new run, first check whether the user already attached or clearly referenced a filled J人旅行神器 template.
2. If no Excel file is present, stop before generating anything. Proactively give the user the bundled template and ask them to fill it, using casual Chinese:

```text
我先给你一份模板，你按这一张表填行程就行。

填完后把 Excel 发回来，我就帮你生成一个手机上能打开、也能添加到桌面的旅行计划 app。
```

3. Copy `assets/j-travel-template.xlsx` to the current workspace with a friendly filename such as `J人旅行神器-行程模板.xlsx`, return that file path, and ask the user to fill that file and upload/send it back.
4. Tell the user clearly: the template includes about 3 days of sample data and they should delete the sample rows before uploading their real trip.
5. If the user attached an Excel file that is not based on the template, do not guess silently. Explain that the app uses a fixed one-sheet template for reliability, then provide the template and ask them to move the content into it.
6. After a filled template is available, run the generator:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs create --excel <trip.xlsx> --out <workdir>/<repo-name>
```

7. Review generated `dist/` locally by running:

```bash
cd <workdir>/<repo-name>
npm install
npm run build
```

8. Before publishing, perform the privacy check from `references/privacy-check.md`.
9. Publish with GitHub Pages:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <workdir>/<repo-name> --repo-url <github-repo-url>
```

10. Return the GitHub Pages URL and phone instructions:

- iPhone: open in Safari, tap Share, choose `添加到主屏幕`.
- Android: open in Chrome, tap menu, choose `安装应用` or `添加到主屏幕`.

## Excel Input

Read `references/excel-schema.md` when validating or explaining the workbook format.

Accepted template:

- One sheet named `行程`
- One table with columns: `日期`, `星期`, `城市`, `时间`, `行程`, `交通`, `住宿`
- The bundled template contains sample rows. Users should delete sample rows before uploading.

Infer daily action cards from `行程`, transport cards from `交通` plus transport-like activity text, and lodging cards from `住宿`.

## Publishing Rules

Read `references/github-pages.md` before publishing.

Default publishing strategy:

- One trip equals one public GitHub repo.
- Use a safe repo name from the trip title, for example `japan-2026-trip`.
- Use GitHub Pages from the `gh-pages` branch.
- Ask the user for a public GitHub repo URL unless an `origin` remote is already configured.
- Use `--repo-url <github-repo-url>` so the generator can set `origin`, push `main`, and deploy the `gh-pages` branch.

## Quality Bar

- The generated app must build without errors.
- The page must be mobile-first and usable at 390px width.
- Text must not overflow buttons or cards.
- The app must include a web app manifest and install guidance.
- The result must not require users to open Excel during the trip.
- The final response must include the generated URL, source folder, and any publishing limitation.
