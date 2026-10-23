# ExamMatrix PowerShell Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         ExamMatrix: Secure Examination Platform Launcher" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend API Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js"

Write-Host "Starting Frontend Mobile/Web Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Services successfully launched in independent windows!" -ForegroundColor Green
Write-Host " - Web & Mobile Portal:  http://localhost:3000" -ForegroundColor White
Write-Host " - Backend API Health:   http://localhost:5000/api/health" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
