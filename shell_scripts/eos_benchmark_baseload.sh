#!/bin/bash

txPerSec=10

for rep in {1..10}
do
    echo "Starting trial $rep with $txPerSec baseload 250."
    rm -f accounts.json
    node set_up_accounts.js
    sshpass -p eos2 ssh -l eos2 192.168.122.93 "cd /home/eos2; rm -f accounts.json"
    sshpass -p eos3 ssh -l eos3 192.168.122.29 "cd /home/eos3; rm -f accounts.json"
    sshpass -p eos4 ssh -l eos4 192.168.122.148 "cd /home/eos4; rm -f accounts.json"

    sshpass -p eos2 scp accounts.json eos2@192.168.122.93:/home/eos2
    sshpass -p eos3 scp accounts.json eos3@192.168.122.29:/home/eos3
    sshpass -p eos4 scp accounts.json eos4@192.168.122.148:/home/eos4

    cat accounts.json

    sleep 10s

    echo "Starting eos2 at time: $(date +%s)"
    sshpass -p eos2 ssh -l eos2 192.168.122.93 "cd /home/eos2;  node tx.js" &
    echo "Starting eos3 at time: $(date +%s)"
    sshpass -p eos3 ssh -l eos3 192.168.122.29 "cd /home/eos3; node tx.js" &
    echo "Starting eos4 at time: $(date +%s)"
    sshpass -p eos4 ssh -l eos4 192.168.122.148 "cd /home/eos4; node tx.js" &

    sleep 15s

    node eos.js 30 $txPerSec 250

    echo "Sleeping for 5 minutes."
    sleep 5m
done

exit 0