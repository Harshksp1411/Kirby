#!/bin/bash
# record + finish a list of films sequentially: recall.sh name:seed name:seed ...
cd "$(dirname "$0")/.."
for x in "$@"; do n=${x%%:*}; s=${x##*:}; echo "== $n" ; NODE_PATH=/opt/npm-tools/node_modules timeout 600 node rec.js k/$n.js frames_$n 2>&1 | grep -v "^\s*at " | tail -3; python3 k/finish.py $n $s 2>&1 | tail -1; done
