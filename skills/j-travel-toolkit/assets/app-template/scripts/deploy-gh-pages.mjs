import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

if (!fs.existsSync(dist)) {
  throw new Error("dist/ does not exist. Run npm run build first.");
}

function run(cmd, args, cwd = root) {
  execFileSync(cmd, args, { cwd, stdio: "inherit" });
}

function tryRun(cmd, args, cwd = root) {
  try {
    execFileSync(cmd, args, { cwd, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const tmp = path.join(root, ".deploy-gh-pages");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
fs.cpSync(dist, tmp, { recursive: true });

let hasBranch = true;
if (
  !tryRun("git", ["fetch", "origin", "gh-pages"], root)
  || !tryRun("git", ["rev-parse", "--verify", "origin/gh-pages"], root)
) {
  hasBranch = false;
}

const worktree = path.join(root, ".gh-pages-worktree");
fs.rmSync(worktree, { recursive: true, force: true });
run("git", ["worktree", "prune"], root);
if (hasBranch) {
  run("git", ["worktree", "add", worktree, "origin/gh-pages"], root);
} else {
  run("git", ["worktree", "add", "--detach", worktree, "HEAD"], root);
  run("git", ["checkout", "--orphan", "gh-pages"], worktree);
}

for (const entry of fs.readdirSync(worktree)) {
  if (entry === ".git") continue;
  fs.rmSync(path.join(worktree, entry), { recursive: true, force: true });
}
fs.cpSync(tmp, worktree, { recursive: true });
fs.writeFileSync(path.join(worktree, ".nojekyll"), "");

run("git", ["add", "."], worktree);
try {
  run("git", ["commit", "-m", "Deploy travel action cards"], worktree);
} catch {
  console.log("No deploy changes to commit.");
}
run("git", ["push", "origin", "HEAD:gh-pages"], worktree);

run("git", ["worktree", "remove", worktree, "--force"], root);
fs.rmSync(tmp, { recursive: true, force: true });
