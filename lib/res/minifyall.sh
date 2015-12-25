#!/bin/bash
find . -name \*.min.js -exec rm -f {} \; ; find . -name \*.js | while read x; do echo $x; uglify -s $x -o ${x:0:${#x}-3}.min.js >/dev/null; done
