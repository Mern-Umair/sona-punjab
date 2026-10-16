/**
 * Build website + admin into backend/public for Ubuntu/AWS Node hosting.
 * Website → /   |   Admin → /admin   |   API → /api
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "backend", "public");

function run(cmd, cwd) {
  console.log(`\n==> ${cmd}  (${cwd})`);
  execSync(cmd, { cwd, stdio: "inherit" });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

run("npm run build", path.join(root, "dhunni"));
run("npm run build", path.join(root, "admin"));

fs.rmSync(publicDir, { recursive: true, force: true });
copyDir(path.join(root, "dhunni", "dist"), publicDir);
copyDir(path.join(root, "admin", "dist"), path.join(publicDir, "admin"));

console.log("\nDone.");
console.log(`  Website → ${publicDir}`);
console.log(`  Admin   → ${path.join(publicDir, "admin")}`);
console.log("\nOn server: cd backend && npm install && npm start");
console.log("  (or: pm2 start src/index.js --name highflyer)");
