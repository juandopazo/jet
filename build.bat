@echo off

for %%x in (src/*.js) do (
    for /f "tokens=1,2 delims=." %%a in ("%%x") do (
        java -jar compiler.jar --js src/%%a.js --js_output_file build/%%a.min.js
	copy src/%%a.js build/%%a.js
    )
)
for %%x in (src/*.css) do (
    for /f "tokens=1,2 delims=." %%a in ("%%x") do (
        java -jar yuicompressor.jar src/%%a.css -o build/%%a.min.css
    )
)