#!/bin/bash
# This file is needed for AWS Code Deploy

cd /var/www/html/12thDoor-Redux
npm update
npm install
nodejs node_modules/node-sass/scripts/install.js
npm rebuild node-sass
npm install -g bower
bower install --allow-root
gulp build
cp -rf dist/* /var/www/html/shell/
cd /var/www/html/shell/
chmod -R 0777 /var/www/html/shell/assets
cp -rf /var/www/html/shell/assets /var/www/html/
cp -rf /var/www/html/shell/assets /
sed -i -E "s/base href=\"/base href=\"\/shell/" /var/www/html/shell/index.html
