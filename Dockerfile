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
# Vite (cf. vite.config.ts) écrit index.html à la racine et les assets dans ./public/assets/.
# On rassemble dans /app/dist pour faire un COPY propre vers Nginx.
RUN npx tsc -b \
 && npx vite build --mode ${APP_INSTANCE} \
 && mkdir -p /app/dist \
 && cp /app/index.html /app/dist/index.html \
 && cp -r /app/public /app/dist/public \
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
