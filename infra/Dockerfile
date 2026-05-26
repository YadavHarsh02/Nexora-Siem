FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt pyproject.toml ./
COPY src ./src
COPY apps ./apps
COPY config ./config

RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir -e .

EXPOSE 8000

CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
