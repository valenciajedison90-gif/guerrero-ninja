@echo off
title Publicar GUERRERO NINJA en GitHub Pages - jjedi90
color 0A
cls
echo ======================================================================
echo    GUERRERO NINJA 3D - Publicador a GitHub Pages
echo    Autor: jjedi90
echo    Repositorio: https://github.com/valenciajedison90-gif/guerrero-ninja.git
echo ======================================================================
echo.
echo Presiona una tecla para sincronizar y subir a GitHub...
pause
echo.
echo [1/3] Preparando repositorio local...
git init
git config user.name "jjedi90"
git config user.email "jvalealv@contratista.chec.com.co"
git branch -M main
git add .
git commit -m "Publicacion inicial de Guerrero Ninja 3D con multijugador en GitHub Pages"
echo.
echo [2/3] Verificando enlace remoto...
git remote set-url origin https://github.com/valenciajedison90-gif/guerrero-ninja.git
if %ERRORLEVEL% neq 0 git remote add origin https://github.com/valenciajedison90-gif/guerrero-ninja.git
echo.
echo [3/3] Subiendo a GitHub...
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ======================================================================
    echo    TODO LISTO: Subido con exito a GitHub.
    echo    Tu enlace para jugar en linea:
    echo    https://valenciajedison90-gif.github.io/guerrero-ninja/
    echo ======================================================================
) else (
    echo [!] Si el repositorio no existe aun en tu cuenta, crealo aqui:
    echo     https://github.com/new con el nombre "guerrero-ninja" (publico).
    echo [!] Luego vuelve a ejecutar este archivo para subirlo.
)
echo.
pause
