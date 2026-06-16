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
