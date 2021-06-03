#!/bin/bash

txPerSec=10

for rep in {1..10}
do
    echo "Starting trial $rep with $txPerSec baseload 15."
    echo "Starting eth2 at time: $(date +%s)"
    sshpass -p eth2 ssh -l eth2 192.168.122.228 "cd /home/eth2/setup; node baseload.js" &
    echo "Starting eth3 at time: $(date +%s)"
    sshpass -p eth3 ssh -l eth3 192.168.122.237 "cd /home/eth3/setup; node baseload.js" &
    echo "Starting eth4 at time: $(date +%s)"
    sshpass -p eth4 ssh -l eth4 192.168.122.243 "cd /home/eth4/setup; node baseload.js" &

    sleep 15s
    
    node trial.js 30 $txPerSec 15

    echo "Sleeping for 5 minutes."
    sleep 5m
done

exit 0