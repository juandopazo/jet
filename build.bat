@echo off

for /f %%x in ('dir src /b/ad') do (
    if not %%x==.svn (
        for /f "tokens=1,2 delims=." %%a in ("%%x") do (
            java -jar compiler.jar --js src\%%a\%%a.js --js_output_file build\%%a.min.js
        )
        for /f "tokens=1,2 delims=." %%a in ("%%x") do (
            java -jar yuicompressor.jar src\%%a\%%a.css -o build\%%a.min.css
        )
        copy src\%%x\*.* build
    )
)

PAUSE