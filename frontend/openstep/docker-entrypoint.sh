#!/bin/sh
set -e

# Determine if we're running in dev or prod based on APP_ENVIRONMENT
APP_ENVIRONMENT="${APP_ENVIRONMENT:-production}"

if [ "${APP_ENVIRONMENT}" = "dev" ]; then
  CONFIG_DIR="/app/src/config"
else
  CONFIG_DIR="/usr/share/nginx/html/config"
fi

mkdir -p "${CONFIG_DIR}"
CONFIG_FILE="${CONFIG_DIR}/config.json"

# Get environment variables with defaults
API_BASE="${API_ENDPOINT:-http://127.0.0.1:8000}"
API_ENDPOINT="${API_BASE}/api"
APP_NAME="${APP_NAME:-OpenStep}"

# Generate config.json
cat > "${CONFIG_FILE}" << EOF
{
  "API_ENDPOINT": "${API_ENDPOINT}",
  "APP_NAME": "${APP_NAME}"
}
EOF

echo "✓ config.json generated"

exec "$@"
