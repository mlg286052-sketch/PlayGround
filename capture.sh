#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
/usr/bin/time -p pwd >/dev/null

: "${RUNTIME_DIR:?RUNTIME_DIR must point to the OMGithub runtime}"
: "${CAPTURE_URL:?CAPTURE_URL must be the exact preview URL to capture}"
: "${CAPTURE_DIR:?CAPTURE_DIR must be an external directory for capture evidence}"

# Keep generated evidence outside the source tree.
PROJECT_DIR="$PROJECT_DIR" /usr/bin/time -p node --input-type=commonjs -e 'const path=require("node:path"); const project=path.resolve(process.env.PROJECT_DIR); const output=path.resolve(process.env.CAPTURE_DIR); if (output === project || output.startsWith(project + path.sep)) { console.error("CAPTURE_DIR must be outside the project directory."); process.exit(1); }'
/usr/bin/time -p env \
  CAPTURE_READY_SELECTOR="canvas" \
  CAPTURE_START_SELECTOR="#start" \
  CAPTURE_STRICT=1 \
  node "$RUNTIME_DIR/scripts/default-capture.mjs"
