#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
/usr/bin/time -p pwd >/dev/null

: "${RUNTIME_DIR:?RUNTIME_DIR must point to the OMGithub runtime}"
PORT="${PORT:-3000}"
OPENCODE_WEB_DIR="${OPENCODE_WEB_DIR:-/home/runner/work/_temp/omgithub-web}"
export PORT OPENCODE_WEB_DIR PROJECT_DIR

# This project is plain static HTML/JavaScript, so it has no local dependencies or build step.
/usr/bin/time -p test -f "$PROJECT_DIR/index.html"
/usr/bin/time -p mkdir -p "$OPENCODE_WEB_DIR"
/usr/bin/time -p node --input-type=commonjs -e 'const fs=require("node:fs"); const path=require("node:path"); fs.writeFileSync(path.join(process.env.OPENCODE_WEB_DIR,"deployment-output.json"), JSON.stringify({project:process.env.PROJECT_DIR,directory:process.env.PROJECT_DIR}));'

# The runtime serves the project root and remains in the foreground for controller supervision.
exec /usr/bin/time -p node "$RUNTIME_DIR/scripts/default-start.mjs"
