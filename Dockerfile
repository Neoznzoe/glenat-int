# syntax=docker/dockerfile:1

# Étape de compilation: installe l'environnement Node 18.20.8 requis et construit les assets.
FROM node:18.20.8-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape de runtime: sert les artefacts statiques produits par Vite via Nginx.
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
