---
name: j-travel-toolkit
description: "Generate a Chinese mobile travel action-card web app from an Excel itinerary and publish it to GitHub Pages. Use when users ask for J人旅行神器, J人旅行, travel action cards, converting trip Excel or dense itinerary docs into a phone-friendly daily travel assistant, GitHub Pages travel app links, or a skill that turns a travel plan spreadsheet into a mobile home-screen app."
---

# J人旅行神器

Turn a dense Chinese travel Excel into a mobile-first travel action-card app and publish it to GitHub Pages.

## What To Build

Create a phone-friendly Chinese travel assistant for J-type planners:

- Replace dense Feishu/Tencent Docs/Excel reading with one clear daily action card.
- Use bottom navigation: `行程`, `贴士`, `交通`, `快捷`.
- Use `交通`, not `航班`, because it includes flights, trains, taxis, walking, ferries, and transfers.
- Keep the app Chinese-only.
- Keep map support as external links only. Do not build an embedded map component.
- Remove "已预约" as a required template column. If the user writes notes such as `已预约`, treat it as plain activity detail.
- Prefer the mature Europe-trip visual style: warm travel palette, rounded mobile cards, horizontal day selector, timeline activities, transport cards, packing checklist.

## Workflow

1. Locate the user's Excel file.
2. If the user has no Excel, copy `assets/j-travel-template.xlsx` and ask them to fill it.
3. Run the generator:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs create --excel <trip.xlsx> --out <workdir>/<repo-name>
```

4. Review generated `dist/` locally by running:

```bash
cd <workdir>/<repo-name>
npm install
npm run build
```

5. Before publishing, perform the privacy check from `references/privacy-check.md`.
6. Publish with GitHub Pages:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <workdir>/<repo-name> --repo-url <github-repo-url>
```

7. Return the GitHub Pages URL and phone instructions:

- iPhone: open in Safari, tap Share, choose `添加到主屏幕`.
- Android: open in Chrome, tap menu, choose `安装应用` or `添加到主屏幕`.

## Excel Input

Read `references/excel-schema.md` when validating or explaining the workbook format.

Minimum accepted sheet:

- A sheet named `行程`
- Columns: `日期`, `星期`, `城市`, `时间`, `行程`

Optional sheets:

- `交通`
- `住宿`
- `贴士`
- `物品`
- `快捷`
- `信息`

If only `行程` exists, infer daily action cards and transport-like activities from the `行程` text.

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
