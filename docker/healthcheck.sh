#!/bin/sh
# Healthcheck complet: vérifie que Nginx répond, que version.json est servi
# et valide, et que index.html est servable (SPA fallback fonctionnel).
set -eu

BASE_URL="${HEALTHCHECK_URL:-http://127.0.0.1}"

# 1. Endpoint /health (Nginx lui-même)
wget -q --spider "${BASE_URL}/health" || {
  echo "FAIL: /health unreachable"
  exit 1
}

# 2. version.json présent et contient un champ "version"
VERSION_JSON=$(wget -qO- "${BASE_URL}/version.json") || {
  echo "FAIL: /version.json unreachable"
  exit 1
}
echo "${VERSION_JSON}" | grep -q '"version"' || {
  echo "FAIL: /version.json missing version field"
  exit 1
}

# 3. index.html servi (SPA fallback fonctionnel)
wget -q --spider "${BASE_URL}/index.html" || {
  echo "FAIL: /index.html unreachable"
  exit 1
}

# 4. SPA fallback: une route React Router quelconque doit retourner 200 (sert index.html)
wget -q --spider "${BASE_URL}/__healthcheck_spa_route__" || {
  echo "FAIL: SPA fallback not working"
  exit 1
}

echo "OK"
exit 0
