cd /d "%~dp0"
node ./fetch-mods.js
git add .
git commit -m "update mods"
git push
pause
exit