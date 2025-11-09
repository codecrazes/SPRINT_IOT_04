const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getGitSha() {
  try {
    const sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return sha || "unknown";
  } catch {
    return "unknown";
  }
}

function upsertEnvLocal(sha) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
    const lines = content.split("\n").filter(Boolean);
    const other = lines.filter((l) => !l.startsWith("EXPO_PUBLIC_GIT_SHA="));
    other.push(`EXPO_PUBLIC_GIT_SHA=${sha}`);
    content = other.join("\n") + "\n";
  } else {
    content = `EXPO_PUBLIC_GIT_SHA=${sha}\n`;
  }
  fs.writeFileSync(envPath, content, "utf8");
}

const sha = getGitSha();
upsertEnvLocal(sha);
console.log(`EXPO_PUBLIC_GIT_SHA=${sha}`);
