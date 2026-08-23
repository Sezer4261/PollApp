@echo off
title Poll App
cd /d "%~dp0"
echo Starte Poll App...
echo Danach oeffnet sich der Browser unter http://127.0.0.1:4200/
npx ng serve --host 127.0.0.1 --port 4200 --open
