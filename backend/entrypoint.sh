#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Wait for the PostgreSQL database to be ready
# ---------------------------------------------------------------------------


echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT} ..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -q; do
    sleep 2
done
echo "PostgreSQL is ready."

# ---------------------------------------------------------------------------
# Ensure local settings file exists (create from sample if missing)
# ---------------------------------------------------------------------------
SETTINGS_DIR="./backend/openstep/openstep/settings"
LOCAL_PY="$SETTINGS_DIR/local.py"
SAMPLE_PY="$SETTINGS_DIR/local.py.sample"

if [ ! -f "$LOCAL_PY" ]; then
    if [ -f "$SAMPLE_PY" ]; then
        echo "Creating $LOCAL_PY from $SAMPLE_PY"
        cp "$SAMPLE_PY" "$LOCAL_PY"
fi

# ---------------------------------------------------------------------------
# Apply migrations
# ---------------------------------------------------------------------------
python manage.py migrate --noinput

# ---------------------------------------------------------------------------
# Collect static files (Django admin, DRF, tinymce, …)
# ---------------------------------------------------------------------------
# Only run collectstatic in production
if [ "${APP_ENVIRONMENT:-dev}" = "prod" ]; then
    echo "Collect static files"
    python manage.py collectstatic --noinput --clear
fi

# ---------------------------------------------------------------------------
# Hand off to the container command (gunicorn or dev server)
# ---------------------------------------------------------------------------
exec "$@"
