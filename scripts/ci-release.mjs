import { execSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

/**
 * Decides how to tag a production release on pushes to main.
 * Writes GitHub Actions outputs: action (skip|tag|bump), version, kind.
 */
function sh(cmd) {
  return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function pkgVersion() {
  return JSON.parse(readFileSync("package.json", "utf8")).version;
}

function lastTag() {
  try {
    return sh("git describe --tags --match 'v[0-9]*' --abbrev=0");
  } catch {
    return "";
  }
}

function parseSemver(value) {
  const parts = String(value).replace(/^v/, "").split(".").map((n) => parseInt(n, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function cmp(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

function bumpKind(log) {
  if (/\[major\]|breaking change|^breaking(\(|:)/im.test(log)) return "major";
  if (/\[minor\]|^feat(\(|:)|\[feat\]/im.test(log)) return "minor";
  return "patch";
}

function bumpSemver(version, kind) {
  let [major, minor, patch] = parseSemver(version);
  if (kind === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

function output(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  console.log(lines.join("\n"));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
  }
}

const message = sh("git log -1 --pretty=%s");
if (/^release:/.test(message)) {
  output({ action: "skip", version: pkgVersion(), kind: "" });
  process.exit(0);
}

try {
  const exact = sh('git describe --tags --match "v[0-9]*" --exact-match');
  if (exact) {
    output({ action: "skip", version: exact.replace(/^v/, ""), kind: "" });
    process.exit(0);
  }
} catch {
  // HEAD is not tagged
}

const pkg = pkgVersion();
const previous = lastTag();

if (!previous) {
  output({ action: "tag", version: pkg, kind: "" });
  process.exit(0);
}

const previousVersion = previous.replace(/^v/, "");
if (cmp(pkg, previousVersion) > 0) {
  output({ action: "tag", version: pkg, kind: "" });
  process.exit(0);
}

const log = sh(`git log ${previous}..HEAD --pretty=%s`);
const kind = bumpKind(log);
output({ action: "bump", version: bumpSemver(previousVersion, kind), kind });
