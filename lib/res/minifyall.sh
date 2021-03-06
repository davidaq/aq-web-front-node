#!/bin/bash
pushd `dirname $0` > /dev/null
find . -name \*.min.js -exec rm -f {} \; ; find . -name \*.js | while read x; do echo $x; uglifyjs $x -c -m -o ${x:0:${#x}-3}.min.js ; done
rm libPreset*.min.js
popd > /dev/null
