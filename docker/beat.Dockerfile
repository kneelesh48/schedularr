FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

COPY backend ./

RUN mkdir -p /home/appuser/.cache/uv && \
    chown -R appuser:appuser /app /home/appuser

USER appuser

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD uv run celery -A backend inspect ping || exit 1

CMD ["uv", "run", "celery", "-A", "backend", "beat", "--loglevel=info", "--scheduler", "django_celery_beat.schedulers:DatabaseScheduler"]