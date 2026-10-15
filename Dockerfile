# syntax=docker/dockerfile:1

# --- build --------------------------------------------------------------------
# LibreScope is a static site: Vite compiles it to plain files in `dist/`.
FROM node:24-alpine AS build

WORKDIR /app

# Dependencies first, so this layer is only rebuilt when the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- serve --------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx's default configuration serves index.html at / and the copied
# data.json alongside it, which is exactly what the app fetches.
