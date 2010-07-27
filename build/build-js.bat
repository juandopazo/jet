@echo off

for %%x in (jet ajax anim base container cookie datasource datatable dragdrop flash forms imageloader json plasma resize sizzle tabs xsl) do (
java -jar compiler.jar --js ../src/%%x.js --js_output_file %%x.min.js
)