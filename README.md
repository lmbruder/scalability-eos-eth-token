# Comparing the scalability of non-native tokens on the Ethereum and EOSIO blockchain

### Prerequisites to use the TypeScript and Shell scripts
- `sudo apt install npm`
- `sudo apt install node-typescript`
- `npm i @types/node`
#### Ethereum specific 
- `npm install web3`
- `npm install net`
- `npm install fs`

#### EOSIO specific
- `npm install eosjs`
- `npm install eosjs-keygen`

### Getting Started
#### Ethereum
- add your specific geth.ipc path to `trial.ts`
- replace values in the `Trial` constructor
- execute `set_up_accounts.ts` and copy account data to the other virtual machines
- replace values in `ethereum_benchmark.sh` or `ethereum_benchmark_baseload.sh` to fit your needs and setup

#### EOSIO
- replace values in the `Trial` constructor
- replace values in `eosio_benchmark.sh` or `eosio_benchmark_baseload.sh` to fit your needs and setup

- use the command `tsc` to convert TypeScript code to JavaScript code
