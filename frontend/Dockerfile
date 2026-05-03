# syntax=docker/dockerfile:1.7

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps with a clean, lockfile-driven install for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Bake the API base URL into the bundle. Vite resolves import.meta.env at
# build time, so the value MUST be passed via --build-arg in CI.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM nginx:alpine AS runtime

# SPA-aware config: try_files falls back to index.html so React Router
# deep links don't 404 on refresh.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
