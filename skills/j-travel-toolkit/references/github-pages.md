# GitHub Pages Publishing

## Default Strategy

Create one public GitHub repository per trip and publish the static build to a `gh-pages` branch.

Expected URL:

```text
https://<github-user>.github.io/<repo-name>/
```

## Prerequisites

Publishing requires GitHub command-line access.

Preferred:

```bash
gh auth status
```

If `gh` is unavailable or not authenticated, ask the user to either:

- Run `gh auth login`, or
- Create a public GitHub repository and provide the repository URL.

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

Preferred command from the generated site directory:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <site-dir> --repo-name <safe-trip-repo-name>
```

Use a repo URL when GitHub CLI is unavailable:

```bash
node <skill-dir>/scripts/j-travel-toolkit.mjs publish --site <site-dir> --repo-url <repo-url>
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
