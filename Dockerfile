FROM python:3.12-slim AS backend

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY apps/ apps/
COPY rag/ rag/
COPY .env* ./

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000"]


FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY apps/ui/package.json apps/ui/package-lock.json* ./
RUN npm install

COPY apps/ui/ .
RUN npm run build


FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY apps/ui/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
