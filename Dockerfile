# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=18.20.8

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
ARG APP_VERSION=2.0.0
ARG APP_INSTANCE=developpement
ARG GIT_COMMIT=local
ARG BUILD_DATE=unknown
ENV VITE_APP_VERSION=${APP_VERSION} \
    VITE_APP_INSTANCE=${APP_INSTANCE} \
    VITE_GIT_COMMIT=${GIT_COMMIT}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Vite charge .env.${APP_INSTANCE} via --mode (cf. .env.developpement, .env.recette, .env.production).
# Vite écrit à la racine (outDir='.') et les assets dans ./public/assets/ (compatibilité legacy).
# On rassemble dans /app/dist pour faire un COPY propre vers Nginx.
# IMPORTANT: si index.html dans le repo est pollué (références /public/assets/index-XXX.js),
# on le restaure depuis une version propre avant le build pour éviter l'erreur Rollup.
RUN cat > /tmp/index.html.clean <<'INDEXEOF'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon-glenat-red.webp" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Glénat | Intranet</title>
    <script type="module" src="/src/main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
INDEXEOF
RUN cp /tmp/index.html.clean /app/index.html \
 && echo "=== /app contents ===" \
 && (ls -la /app/ | grep -iE '\.?env' || echo "(no env-related files in /app/)") \
 && ENV_FILE="/app/.env.${APP_INSTANCE}" \
 && if [ ! -f "$ENV_FILE" ]; then ENV_FILE="/app/env.${APP_INSTANCE}"; fi \
 && if [ ! -f "$ENV_FILE" ]; then \
        echo "ERROR: no env file (.env.${APP_INSTANCE} or env.${APP_INSTANCE}) found in build context"; \
        exit 1; \
    fi \
 && echo "Using env file: $ENV_FILE" \
 && echo "=== Sourcing $ENV_FILE into process env ===" \
 && set -a \
 && . "$ENV_FILE" \
 && set +a \
 && echo "Build env check:" \
 && { [ -n "$VITE_OAUTH_BASE_URL" ] && echo "  VITE_OAUTH_BASE_URL: set" || { echo "  VITE_OAUTH_BASE_URL: MISSING"; exit 1; }; } \
 && { [ -n "$VITE_OAUTH_CLIENT_ID" ] && echo "  VITE_OAUTH_CLIENT_ID: set" || { echo "  VITE_OAUTH_CLIENT_ID: MISSING"; exit 1; }; } \
 && { [ -n "$VITE_API_BASE_URL" ] && echo "  VITE_API_BASE_URL: set" || { echo "  VITE_API_BASE_URL: MISSING"; exit 1; }; } \
 && npx tsc -b \
 && npx vite build --mode ${APP_INSTANCE} \
 && mkdir -p /app/dist \
 && cp /app/index.html /app/dist/index.html \
 && cp -r /app/public /app/dist/public \
 && test -f /app/dist/index.html || { echo "ERROR: index.html missing after build"; exit 1; } \
 && printf '{\n  "version":"%s",\n  "instance":"%s",\n  "commit":"%s",\n  "buildDate":"%s"\n}\n' \
        "${APP_VERSION}" "${APP_INSTANCE}" "${GIT_COMMIT}" "${BUILD_DATE}" \
        > /app/dist/version.json

FROM nginx:1.27-alpine AS runtime
ARG APP_VERSION=2.0.0
ARG APP_INSTANCE=developpement
ARG GIT_COMMIT=local
LABEL org.opencontainers.image.title="Glenat Intranet" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_COMMIT}" \
      com.glenat.app.instance="${APP_INSTANCE}"

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=10s \
    CMD /usr/local/bin/healthcheck.sh
