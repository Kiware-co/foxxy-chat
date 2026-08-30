#!/usr/bin/env bash
#
# Construye la imagen Docker de Foxxy Chat replicando EXACTAMENTE lo que hace
# el workflow oficial de Chatwoot para la Community Edition
# (.github/workflows/publish_foss_docker.yml):
#
#   1. rm -rf enterprise spec/enterprise   -> deja solo el codigo MIT
#   2. ENV CW_EDITION="ce"                 -> marca la imagen como CE
#   3. docker build -f docker/Dockerfile .
#
# Uso:
#   ./docker/build-foxxy.sh <tag-completo>
#   ./docker/build-foxxy.sh localhost:5000/kiware-co/foxxy-chat:v4.17.1-foxxy.1
#
# Requiere ejecutarse desde la raiz de un clon del repo (necesita .git: el
# Dockerfile hace `git rev-parse HEAD > /app/.git_sha`).
#
# IMPORTANTE: el script MODIFICA el arbol de trabajo (borra enterprise/ y
# anade una linea a docker/Dockerfile). Ejecutalo sobre un clon desechable,
# nunca sobre tu copia de desarrollo. Aborta si el arbol esta sucio.

set -euo pipefail

TAG="${1:?Uso: $0 <tag-completo-de-la-imagen>}"
DOCKER="${DOCKER:-docker}"

cd "$(git rev-parse --show-toplevel)"

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: el arbol de trabajo tiene cambios sin commitear." >&2
  echo "       Este script destruye ficheros; usa un clon limpio." >&2
  exit 1
fi

echo "==> Commit: $(git rev-parse HEAD)  rama: $(git rev-parse --abbrev-ref HEAD)"

echo "==> Eliminando codigo enterprise (build Community Edition)"
rm -rf enterprise spec/enterprise

echo "==> Marcando la edicion como CE"
printf '\nENV CW_EDITION="ce"\n' >> docker/Dockerfile

echo "==> docker build -> ${TAG}"
"$DOCKER" build \
  --file docker/Dockerfile \
  --tag "${TAG}" \
  .

echo "==> Listo: ${TAG}"
