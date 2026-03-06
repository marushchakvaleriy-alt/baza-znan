@echo off
chcp 65001 >nul
echo Запуск Помічника Розрахунків...
cd /d "C:\Users\v_marushchak\Desktop\помічник розрахунків"
start http://localhost:5173
echo Сервер запускається. Не закривайте це вікно.
npm run dev
pause
