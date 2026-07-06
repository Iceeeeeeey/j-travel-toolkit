#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(process.argv[2] || ".");
const manifestPath = path.join(rootDir, ".codex-plugin", "plugin.json");
if (!fs.existsSync(manifestPath)) fail(`Missing plugin manifest: ${manifestPath}`);

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail(`Invalid plugin.json: ${error.message}`);
}

const requiredStringFields = ["name", "version", "description", "license", "skills"];
for (const field of requiredStringFields) {
  if (!manifest[field] || typeof manifest[field] !== "string") fail(`plugin.json missing string field: ${field}`);
}
if (manifest.name !== path.basename(rootDir)) {
  fail(`Plugin name must match folder name. Found "${manifest.name}", expected "${path.basename(rootDir)}".`);
}
if (!/^[a-z0-9-]+$/.test(manifest.name)) {
  fail("Plugin name must use lowercase letters, digits, and hyphens only.");
}
if (!fs.existsSync(path.join(rootDir, manifest.skills))) {
  fail(`Plugin skills path does not exist: ${manifest.skills}`);
}
if (JSON.stringify(manifest).includes("[TODO:")) {
  fail("plugin.json must not contain TODO placeholders.");
}

const ui = manifest.interface || {};
for (const field of ["displayName", "shortDescription", "longDescription", "defaultPrompt"]) {
  if (!ui[field]) fail(`plugin.json interface missing field: ${field}`);
}

console.log(JSON.stringify({
  ok: true,
  plugin: manifest.name,
  version: manifest.version,
  skills: manifest.skills,
}, null, 2));

function fail(message) {
  console.error(message);
  process.exit(1);
}
