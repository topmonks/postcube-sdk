#!/bin/sh
set -ex

. scripts/setup_shell.sh

if [ "$DEBUG_SKIP_NPM_INSTALL" != "1" ]; then
    npm install
fi

if [ "$DEBUG_SKIP_CLEANING" != "1" ]; then
    node_modules/.bin/rimraf $BUILD_PATH
fi

npm run build:node

cp .gitignore .npmignore protocol.proto protocol.options $BUILD_PATH

sed 's/\@topmonks\/postcube/\@topmonks\/postcube-node/; s/[[:space:]]*"\module".*//; s/[[:space:]]*"\browser".*//; s/[[:space:]]*"\@capacitor\/core".*//; s/[[:space:]]*"\@capacitor-community\/bluetooth-le".*//; s/[[:space:]]*"cordova-plugin-ble-central".*//; s/[[:space:]]*"\@types\/web-bluetooth".*//; s/[[:space:]]*"\@types\/react".*//; s/[[:space:]]*"react".*//' package.json > $BUILD_PATH/package.json

if [ "$DEBUG_SKIP_NPM_INSTALL" != "1" ]; then
    npm install --prefix $BUILD_PATH
fi

cat /dev/null > $BUILD_PATH/cjs/react.js
echo "$(sed '/react/d' $BUILD_PATH/cjs/index.js)" > $BUILD_PATH/cjs/index.js

cat $BUILD_PATH/cjs/apiBLE/postcube.empty.js > $BUILD_PATH/cjs/apiBLE/postcube.web.js
cat $BUILD_PATH/cjs/apiBLE/postcube.empty.js > $BUILD_PATH/cjs/apiBLE/postcube.cordova.js
cat $BUILD_PATH/cjs/apiBLE/postcube.empty.js > $BUILD_PATH/cjs/apiBLE/postcube.capacitor.js
