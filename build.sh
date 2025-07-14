#!/bin/bash
cd /home/vijay/projects/VSPlugin/intellipy
echo "Compiling TypeScript..."
./node_modules/.bin/tsc -p .
echo "Packaging extension..."
./node_modules/.bin/vsce package
echo "Done!"
ls -la *.vsix