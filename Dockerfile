FROM python:3.13-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml ./
COPY uv.lock ./
RUN pip install uv
RUN uv sync --frozen

FROM python:3.13-slim
WORKDIR /app
COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv
COPY --from=builder /app/.venv /app/.venv
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app
COPY --chown=app:app . .
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uv", "run", "python", "main.py"]
