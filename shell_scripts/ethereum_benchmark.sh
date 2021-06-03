#!/bin/bash

txPerSec=10

for rep in {1..10}
    do
    echo "Starting trial $rep with $txPerSec."
    node trial.js 30 $txPerSec
    echo "Sleeping for 5 minutes."
    sleep 5m
done

exit 0