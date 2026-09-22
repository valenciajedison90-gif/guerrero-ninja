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
git config user.name "jjedi90"
git config user.email "jvalealv@contratista.chec.com.co"
git branch -M main
git add -A
git commit -m "Subida de Guerrero Ninja 3D para GitHub Pages" >nul 2>&1
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
    echo    TODO LISTO: Subido con exito a GitHub!
    echo.
    echo    Tu enlace para jugar en linea (en 1 minuto estara activo):
    echo    https://valenciajedison90-gif.github.io/guerrero-ninja/
    echo ======================================================================
) else (
    echo ======================================================================
    echo    [!] Si se abrio una ventana de tu navegador web:
    echo        Haz clic en "Sign in with your browser" / "Authorize" para
    echo        darle permiso a Git de subir los archivos a tu cuenta.
    echo.
    echo    [!] Luego vuelve a presionar una tecla en esta ventana o vuelve a
    echo        ejecutar este archivo.
    echo ======================================================================
)
echo.
pause
