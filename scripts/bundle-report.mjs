import fs from "fs";
import path from "path";
import zlib from "zlib";

const root = process.cwd();
const clientDirCandidates = [
  path.join(root, "dist", "client"),
  path.join(root, "dist"),
];

function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p);
  } catch {
    return null;
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (full.includes(path.sep + "server" + path.sep)) continue;
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

const clientDir = clientDirCandidates.find(dirExists);
if (!clientDir) {
  console.error("dist not found. Run `npm run build` first.");
  process.exit(1);
}

const allFiles = walk(clientDir);
const jsFiles = allFiles.filter((f) => f.endsWith(".js"));

let total = 0;
let totalGz = 0;
const rows = [];

for (const f of jsFiles) {
  const buf = readFileSafe(f);
  if (!buf) continue;
  const size = buf.length;
  const gz = zlib.gzipSync(buf, { level: 9 }).length;
  total += size;
  totalGz += gz;
  rows.push({
    file: path.relative(root, f),
    size,
    sizeHuman: kb(size) + " kB",
    gz,
    gzHuman: kb(gz) + " kB",
  });
}

rows.sort((a, b) => b.size - a.size);

function kb(n) {
  return (n / 1024).toFixed(1);
}

console.log("\nJavaScript bundle report\n");
if (rows.length === 0) {
  console.log("No client JS files found under dist.");
  process.exit(0);
}

const topN = 15;
const header = `${"Size (kB)".padStart(10)}  ${"Gzip (kB)".padStart(10)}  File`;
console.log(header);
console.log("-".repeat(header.length));
for (const r of rows.slice(0, topN)) {
  console.log(
    `${kb(r.size).padStart(10)}  ${kb(r.gz).padStart(10)}  ${r.file}`,
  );
}
if (rows.length > topN) {
  console.log(`... and ${rows.length - topN} more files`);
}

console.log("\nTotals");
console.log("-".repeat(20));
console.log(`Files: ${rows.length}`);
console.log(`Total JS: ${kb(total)} kB`);
console.log(`Total JS (gzip): ${kb(totalGz)} kB`);

const outJson = path.join(root, "dist", "bundle-report.json");
fs.writeFileSync(
  outJson,
  JSON.stringify(
    {
      files: rows,
      totalBytes: total,
      totalHuman: kb(total) + " kB",
      totalGzipBytes: totalGz,
      totalGzipHuman: kb(totalGz) + " kB",
    },
    null,
    2,
  ),
);
console.log(`\nWrote ${path.relative(root, outJson)}`);
