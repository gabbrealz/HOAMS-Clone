# ==========================================
# 1. Build Stage
# ==========================================
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/base.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r base.txt

# ==========================================
# 2. Runtime Stage
# ==========================================
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY . /app/

RUN adduser --disabled-password --gecos "" django-user && \
    chown -R django-user:django-user /app

USER django-user

# Runs migrations, collects static files, and starts Gunicorn on Render's assigned $PORT
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120 config.wsgi:application"]