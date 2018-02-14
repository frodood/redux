#!/bin/bash
# This file is needed for AWS Code Deploy

cd /var/www/html/12thDoor-Redux
npm install
npm install -g bower
bower install --allow-root
gulp build
sudo cp -rf dist/* /var/www/html/shell/
cd /var/www/html/shell/
sudo cp -rf assets/* /var/www/html/
sudo cp -rf assets/* /
chmod -R 0777 /assets
sed -i -E "s/base href=\"/base href=\"\/shell/" /var/www/html/shell/index.html
