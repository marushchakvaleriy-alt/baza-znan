@echo off
chcp 65001 > nul
cd /d "%~dp0"
mkdir "c:\Users\v_marushchak\Desktop\помічник розрахунків\public\articles\schemes-ergonomics"
xcopy "c:\Users\v_marushchak\Desktop\помічник розрахунків\наповненя\виконано\Схеми Ергономіка\images\*" "c:\Users\v_marushchak\Desktop\помічник розрахунків\public\articles\schemes-ergonomics\" /Y
pause
