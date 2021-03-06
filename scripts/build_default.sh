#!/bin/sh
set -ex

. scripts/setup_shell.sh

if [ "$DEBUG_SKIP_NPM_INSTALL" != "1" ]; then
    npm install
fi

if [ "$DEBUG_SKIP_CLEANING" != "1" ]; then
    node_modules/.bin/rimraf $BUILD_PATH
fi

npm run build:browser

cp .gitignore .npmignore protocol.proto protocol.options $BUILD_PATH

# testing # sed '/esm\/index.js/d; /umd\/index.js/d; s/[[:space:]]*"\@abandonware\/noble".*//; s/[[:space:]]*"\@types\/noble".*//' package.json > $BUILD_PATH/package.json
sed 's/[[:space:]]*"\@abandonware\/noble".*//; s/[[:space:]]*"\@types\/noble".*//' package.json > $BUILD_PATH/package.json

if [ "$DEBUG_SKIP_NPM_INSTALL" != "1" ]; then
    npm install --prefix $BUILD_PATH
fi

cat $BUILD_PATH/cjs/apiBLE/postcube.empty.js > $BUILD_PATH/cjs/apiBLE/postcube.node.js
cat $BUILD_PATH/esm/apiBLE/postcube.empty.js > $BUILD_PATH/esm/apiBLE/postcube.node.js
cat $BUILD_PATH/umd/apiBLE/postcube.empty.js > $BUILD_PATH/umd/apiBLE/postcube.node.js
