#!/bin/bash

# Practice safe scripting
set -e          # If a command fails, make the whole script exit,
set -u          # Treat unset variables as an error, and immediately exit.
set -o pipefail # If a command in a pipeline fails, make the whole command fail

export COMPONENT="gully"


export VERSION POINT_VERSION
VERSION="$(jq -r '.version' package.json)"
POINT_VERSION="${RELEASE_VERSION:-"${VERSION}.${CI_PIPELINE_IID:-0}"}"

echo "==== building ${COMPONENT} files"

tsup --clean src/gully.ts --out-dir target/bundle --metafile --target es2021
chmod +x target/bundle/gully.js

# Set consistant timestamp for determinisitic build output
LAST_CHANGE_DATE=$(git log -1 --date=format:"%Y%m%d%H%M" --format="%ad")
touch -t "${LAST_CHANGE_DATE}" target/bundle/*

echo "==== packing ${COMPONENT} files"

mkdir -p target/dist
zip -X "target/dist/${COMPONENT}-${POINT_VERSION}.zip" target/bundle/*.js
