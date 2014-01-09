#!/bin/bash

which replace >/dev/null

if [[ $? -eq 0 ]]
then
  replace \
    --exclude=bootstrap/bootstrap.less \
    '\.(?!eot|woff|ttf|svg|Microsoft|gradient\(|less)(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)' \
    '.ai1ec-$1' \
    bootstrap/*
  exit 0
else
  echo 'Error: replace not found. Install Node.js then: npm install -g replace'
  exit 1
fi
