## ── Stage 1: Builder ─────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

RUN python -m venv /app/.venv
COPY requirements.txt .
RUN /app/.venv/bin/pip install --no-cache-dir -r requirements.txt


## ── Stage 2: Runtime ─────────────────────────────────────
FROM python:3.11-slim

LABEL maintainer="Isrcode1"
LABEL service="pulseboard-profile"
LABEL version="0.1.0"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl && rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos '' appuser

COPY --from=builder /app/.venv /app/.venv
COPY app/ ./app/

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

USER appuser
EXPOSE 8002

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8002/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "2"]
