# GitHub Pages Publishing

## Default Strategy

Create one public GitHub repository per trip and publish the static build to a `gh-pages` branch.

Expected URL:

```text
https://<github-user>.github.io/<repo-name>/
```

## Prerequisites

Publishing requires one empty public GitHub repository per trip.

Default user flow:

1. Ask the user to open `https://github.com/new`.
2. Ask them to create a `Public` repository with a safe trip repo name.
3. Tell them not to initialize it with README, `.gitignore`, or license.
4. Ask them to paste the repository URL, such as `https://github.com/<user>/<repo>.git`.

GitHub CLI is optional automation only. Do not make ordinary users understand `gh auth login` before they can proceed.

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

Use the pasted repo URL:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <site-dir> --repo-url <repo-url>
```

If the command is run without `--repo-url` and no git `origin` exists, the script will prompt for the repository URL when stdin is interactive.

Optional automation when GitHub CLI is installed and authenticated:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <site-dir> --repo-name <safe-trip-repo-name>
```

If the user intentionally wants to replace an existing generated trip repo, use:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <site-dir> --repo-url <repo-url> --replace-existing
```

Only use `--replace-existing` for a repo that is meant to be owned by this generated trip app.

Expected final URL:

```text
https://<github-user>.github.io/<repo-name>/
```
