@echo off
title Student Performance and Attendance Analytical Dashboard - Govt. Degree College No. 1, D.I. Khan
echo ===============================================================================
echo   STUDENT PERFORMANCE AND ATTENDANCE ANALYTICAL DASHBOARD
echo   Govt. Degree College No. 1, Dera Ismail Khan (D.I. Khan)
echo   Author: Imran (Roll No: CS-2210) ^| Supervisor: Prof. Abdur Rehman
echo   Department of Computer Science ^| Final Year Project (2022-2026)
echo   Architecture: LocalStorage + CSV (Zero-DB Architecture - 100%% Offline)
echo ===============================================================================
echo.
echo Opening Student Performance and Attendance Dashboard in your web browser...
start "" "%~dp0index.html"
echo.
echo Dashboard loaded! You can close this window at any time.
timeout /t 5 >nul
