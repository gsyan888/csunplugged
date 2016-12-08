@echo off
if "%1"==""  goto end

REM get current folder name to set the LimeJS Folder 
for %%* in (.) do set CurrDirName=%%~nx*
set limejsDir=.
if "%CurrDirName%" == "csunplugged" set limejsDir=..

if "%1"=="all" (
	for /d %%D in (%limejsDir%\csunplugged\*) DO  (
		IF EXIST %limejsDir%\csunplugged\%%~nxD\%%~nxD.js  (
			@echo.
			@echo *****************************
			@echo Compiling %%~nxD
			@echo *****************************
			%limejsDir%\bin\lime.py build cs.%%~nxD -a -o %limejsDir%\compiled\html5_%%~nxD\%%~nxD.js
		)	
	)
) else (
	%limejsDir%\bin\lime.py build cs.%1 -a -o %limejsDir%\compiled\html5_%1\%1.js
)

:end
