#!/bin/bash

# Practice safe scripting
set -e          # If a command fails, make the whole script exit,
set -u          # Treat unset variables as an error, and immediately exit.
set -o pipefail # If a command in a pipeline fails, make the whole command fail

export COMPONENT="gully"
export ROOT_DIR="$(dirname $0)/../../../.."


export VERSION POINT_VERSION
VERSION="$(jq -r '.version' ${ROOT_DIR}/package.json)"
POINT_VERSION="${RELEASE_VERSION:-"${VERSION}.${CI_PIPELINE_IID:-0}"}"

echo "==== building ${COMPONENT} files"

tsup --clean src/gully.ts
chmod +x dist/gully.js

echo "==== packing ${COMPONENT} files"

yarn lambda-package zip-package \
  'dist/*.js' \
  'dist/*.js.map' \
  --outputDir "target/dist" \
  --component "${COMPONENT}" \
  --componentVersion "${POINT_VERSION}" \
  --exclude '**/__test__/**' \
  --zipFile "NHSD.PopulationHealth.${COMPONENT}-${POINT_VERSION}.zip"
