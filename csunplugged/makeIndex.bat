@echo off
set PageName=index.html
set URL=https://github.com/gsyan888/csunplugged
REM get current folder name to set the LimeJS Folder 
for %%* in (.) do set CurrDirName=%%~nx*
set limejsDir=.
if "%CurrDirName%" == "csunplugged" set limejsDir=..
set webPage=%limejsDir%\%PageName%
@echo ^<html^> >%webPage%
@echo ^<head^> >>%webPage%
@echo ^<title^>CS UNPLUGGED^</title^> >>%webPage%
@echo ^<style^> >>%webPage%
@echo p { >>%webPage%
@echo   font-size: 24px; >>%webPage%
@echo   text-align: middle; >>%webPage%
@echo } >>%webPage%
@echo img { >>%webPage%
rem @echo   display: block; >>%webPage%
rem @echo   margin: auto; >>%webPage%
@echo   width: 60px; >>%webPage%
@echo   height: 60px; >>%webPage%
rem @echo   ertical-align: middle; >>%webPage%
@echo } >>%webPage%
@echo ^</style^> >>%webPage%
@echo ^</head^> >>%webPage%
@echo ^<body^> >>%webPage%
@echo ^<h1^>CS UNPLUGGED^</h1^> >>%webPage%
for /d %%D in (%limejsDir%\csunplugged\*) DO  (
	IF EXIST %limejsDir%\csunplugged\%%~nxD\%%~nxD.js  (
		@echo ^<p^>^<a href^="compiled/html5_%%~nxD/%%~nxD.html"^>^<img src^="compiled/html5_%%~nxD/assets/icon.png"^>%%~nxD^</a^>^</p^> >>%webPage%
	)	
)
@echo ^<hr size^=1 /^> >>%webPage%
@echo ^<p^>Source:  ^<a href^="%URL%"^>%URL%^</a^> ^</p^> >>%webPage%
@echo ^</body^> >>%webPage%
@echo ^</html^> >>%webPage%

:end
