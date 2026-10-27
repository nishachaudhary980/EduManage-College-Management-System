@echo off
title EduManage Server
color 0A
echo ========================================
echo   EduManage Java Server
echo ========================================
echo.
echo Compiling Server.java...
javac Server.java
if errorlevel 1 (
    echo.
    echo ERROR: Compile nahi hua!
    pause
    exit /b
)
echo Compile ho gaya!
echo.
echo Server start ho raha hai...
echo.
echo Band karne ke liye: Yeh window band kar do
echo ========================================
echo.
java Server
pause