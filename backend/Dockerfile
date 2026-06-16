FROM python:3.12-slim

# Install system dependencies required by GeoDjango (GDAL/GEOS/PROJ) and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    libproj-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libpq-dev \
    postgresql-client \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application source code
COPY openstep/ .

# Create required runtime directories
# - assets/     : Django MEDIA_ROOT (user-uploaded files, mounted as volume in prod)
# - staticfiles/: STATIC_ROOT (populated by collectstatic)
# - static/     : one of STATICFILES_DIRS entries
RUN mkdir -p /app/assets /app/staticfiles /app/static

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
# Default command: production gunicorn server
# Override in docker-compose.dev.yml with: python manage.py runserver 0.0.0.0:8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120", "openstep.wsgi:application"]
