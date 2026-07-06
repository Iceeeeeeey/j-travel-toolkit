# GitHub Pages Publishing

## Default Strategy

Create one public GitHub repository per trip and publish the static build to a `gh-pages` branch.

Expected URL:

```text
https://<github-user>.github.io/<repo-name>/
```

## Prerequisites

Use an existing public GitHub repository URL, or ask the user to create a public repository before publishing.

## Privacy

Before publishing, run a privacy scan. GitHub Pages is public by default.

Do not publish sensitive fields such as:

- Passport or ID numbers
- Full order numbers
- Exact room numbers
- Private phone numbers
- Emergency contact details
- Payment details

## Publish Commands

From a generated site directory:

```bash
npm install
npm run build
```

Use a repo URL:

```bash
git init
git add .
git commit -m "Initial travel app"
git branch -M main
git remote add origin <repo-url>
git push -u origin main
npm run deploy
```
