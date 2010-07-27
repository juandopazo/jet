@echo off

for %%x in (container resize) do (
java -jar compiler.jar --js "C:\Users\Juan Ignacio\Documents\Aptana Studio Workspace\jet\src\%%x.css" --js_output_file "C:\Users\Juan Ignacio\Documents\Aptana Studio Workspace\jet\build\%%x.min.css"
)

PAUSE