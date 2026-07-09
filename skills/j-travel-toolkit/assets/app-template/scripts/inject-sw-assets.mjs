import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const swPath = path.join(distDir, "sw.js");

if (!fs.existsSync(swPath)) {
  throw new Error(`Missing service worker at ${swPath}`);
}

const assets = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];
const assetsDir = path.join(distDir, "assets");

if (fs.existsSync(assetsDir)) {
  for (const name of fs.readdirSync(assetsDir).sort()) {
    if (/\.(js|css|png|jpg|jpeg|svg|webp|woff2?)$/i.test(name)) {
      assets.push(`./assets/${name}`);
    }
  }
}

const cacheVersion = String(Date.now());
const source = fs.readFileSync(swPath, "utf8")
  .replace("__CACHE_VERSION__", cacheVersion)
  .replace("__APP_SHELL__", JSON.stringify(assets, null, 2));

fs.writeFileSync(swPath, source);
console.log(`Prepared offline cache with ${assets.length} files.`);
