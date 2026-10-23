@echo off
title ExamMatrix - Examination Conducting Platform
echo ======================================================================
echo          ExamMatrix: Secure Examination Platform Launcher
echo ======================================================================
echo.
echo Starting Backend Server (Port 5000)...
start "ExamMatrix-Backend" cmd /k "cd backend && node server.js"

echo Starting Frontend Web / Mobile Interface (Port 3000)...
start "ExamMatrix-Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo System started successfully!
echo.
echo - Web & Mobile Portal:  http://localhost:3000
echo - Backend API Health:   http://localhost:5000/api/health
echo.
echo Three Dedicated Views:
echo  1. Student Portal:      Log in with Roll Number + APAAR ID
echo  2. Middleman Portal:    Paper Setter, Mistake Fixer, Auto-Evaluation
echo  3. Admin Portal:        Complete Exam Analytics & Section Breakdowns
echo ======================================================================
pause
