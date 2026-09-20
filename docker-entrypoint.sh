#!/bin/sh
set -eu

env_file="/usr/share/nginx/html/env-config.js"

escape_js() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

clerk_publishable_key="$(escape_js "${VITE_CLERK_PUBLISHABLE_KEY:-}")"
gemini_api_key="$(escape_js "${GEMINI_API_KEY:-${VITE_GEMINI_API_KEY:-}}")"

cat > "$env_file" <<EOF
window.__ENV__ = {
  VITE_CLERK_PUBLISHABLE_KEY: "$clerk_publishable_key",
  GEMINI_API_KEY: "$gemini_api_key"
};
EOF
