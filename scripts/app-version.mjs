import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Versioning (shown in the app footer / About, tagged on GitHub as vX.Y.Z):
 *
 *   PATCH  1.1.0 → 1.1.1  Bug fixes, copy, layout tidy-ups
 *   MINOR  1.1.0 → 1.2.0  New features that keep existing data working
 *                          Mark a merge with [minor] or feat: in the commit/PR title
 *   MAJOR  1.1.0 → 2.0.0  Breaking changes or data-format changes
 *                          Mark a merge with [major] or BREAKING CHANGE
 *
 * Merges to main without a marker bump the PATCH automatically.
 * Bumping package.json ahead of the latest GitHub tag is treated as a manual release.
 */
function git(args) {
  try {
    return execSync(`git ${args}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function semverFromTag(tag) {
  const match = String(tag || "").match(/v?(\d+\.\d+\.\d+)/);
  return match ? match[1] : "";
}

function parseSemver(value) {
  const parts = String(value).replace(/^v/, "").split(".").map((n) => parseInt(n, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function cmpSemver(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

export function resolveAppVersion() {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const envSha = (process.env.COMMIT_REF || process.env.GITHUB_SHA || "").slice(0, 7);
  const sha = envSha || git("rev-parse --short HEAD") || "dev";
  const context = process.env.CONTEXT || "";
  const reviewId = process.env.REVIEW_ID || "";
  const branch =
    process.env.BRANCH || process.env.HEAD || git("rev-parse --abbrev-ref HEAD") || "";

  const latestTag = git('describe --tags --match "v[0-9]*" --abbrev=0');
  const taggedVersion = semverFromTag(latestTag);
  const version =
    taggedVersion && cmpSemver(taggedVersion, pkg.version) > 0 ? taggedVersion : pkg.version;
  const onReleaseTag = Boolean(semverFromTag(git('describe --tags --match "v[0-9]*" --exact-match')));

  let channel = "dev";
  if (context === "production" || branch === "main") channel = "production";
  else if (context === "deploy-preview" || process.env.PULL_REQUEST === "true") channel = "preview";
  else if (context === "branch-deploy") channel = "preview";

  let label = `v${version}`;
  if (channel === "preview" && reviewId) label = `v${version}-preview.${reviewId}`;
  else if (channel === "preview") label = `v${version}-preview`;
  else if (channel === "dev") label = `v${version}-dev`;
  else if (channel === "production" && !onReleaseTag && sha && sha !== "dev") {
    label = `v${version}`;
  }

  return {
    version,
    label,
    sha,
    channel,
    branch,
    tag: latestTag || "",
    onReleaseTag,
  };
}

if (process.argv.includes("--print")) {
  console.log(JSON.stringify(resolveAppVersion(), null, 2));
}
