FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

COPY backend ./

RUN mkdir -p staticfiles && \
    mkdir -p /home/appuser/.cache/uv && \
    uv run manage.py collectstatic --noinput && \
    chown -R appuser:appuser /app /home/appuser

USER appuser

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "--log-level", "info", "backend.wsgi:application"]
