#!/bin/bash
# This file is needed for AWS Code Deploy

# if there is a shellBackup folder, remove it and create an empty shellBackup folder
# if there is a shell folder, backup everything inside into the newly created shellBackup folder
# if there is no shell folder, create a one

if [ -d "/var/www/html/shellBackup" ]; then
	sudo rm -r /var/www/html/shellBackup	
fi

if [ ! -d "/var/www/html/shellBackup" ]; then
	sudo mkdir /var/www/html/shellBackup	
fi

if [ -d "/var/www/html/shell" ]; then
	cp -r /var/www/html/shell/* /var/www/html/shellBackup/	
fi

if [ ! -d "/var/www/html/shell" ]; then
	sudo mkdir /var/www/html/shell	
fi
