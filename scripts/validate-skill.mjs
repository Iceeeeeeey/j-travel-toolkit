#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const skillDir = path.resolve(process.argv[2] || "skills/j-travel-toolkit");
const skillPath = path.join(skillDir, "SKILL.md");

if (!fs.existsSync(skillPath)) fail(`Missing SKILL.md: ${skillPath}`);

const text = fs.readFileSync(skillPath, "utf8");
const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatter) fail("SKILL.md must start with YAML frontmatter.");

const fields = Object.fromEntries(
  frontmatter[1]
    .split(/\r?\n/)
    .map((line) => line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2].replace(/^['"]|['"]$/g, "")])
);

if (fields.name !== path.basename(skillDir)) {
  fail(`Skill name must match folder name. Found "${fields.name}", expected "${path.basename(skillDir)}".`);
}
if (!/^[a-z0-9-]+$/.test(fields.name || "")) {
  fail("Skill name must use lowercase letters, digits, and hyphens only.");
}
if (!fields.description || fields.description.length < 80) {
  fail("Skill description is missing or too short.");
}
if (!fields.description.includes("J人旅行神器") || !fields.description.includes("旅行计划app")) {
  fail("Skill description should include the main Chinese trigger phrases.");
}

const requiredFiles = [
  "agents/openai.yaml",
  "assets/j-travel-template.xlsx",
  "assets/app-template/package.json",
  "scripts/j-travel-toolkit.mjs",
  "scripts/read-xlsx.py",
  "references/excel-schema.md",
  "references/github-pages.md",
  "references/privacy-check.md",
];

for (const relative of requiredFiles) {
  const fullPath = path.join(skillDir, relative);
  if (!fs.existsSync(fullPath)) fail(`Missing required skill file: ${relative}`);
}

console.log(JSON.stringify({
  ok: true,
  skill: fields.name,
  descriptionLength: fields.description.length,
  checkedFiles: requiredFiles.length,
}, null, 2));

function fail(message) {
  console.error(message);
  process.exit(1);
}
