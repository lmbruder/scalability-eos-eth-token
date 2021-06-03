export = {};
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
const { PrivateKey } = require('eosjs-ecc')
const fs = require('fs');

var privateKeys: string[] = ["5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"];

const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch }); //required to read blockchain state
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()}); //required to submit transactions

class keys {
    accName: string;
    publicKey: string;
    privateKey: string;
};

// choose a random account name 
function randomAccountName() {
    var chosenAccName = [];
    const possibleChars = '12345abcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < 12; i++) {
        chosenAccName.push(possibleChars.charAt(Math.floor(Math.random() * 31)));
    };
    return chosenAccName.join('');
};

async function setUpAccounts() {
    // create 5 public-private key pairs
    console.log("Generating keypairs and creating accounts.");
    var keyPairs: keys[] = [];
    var i: number;
    for (i = 0; i < 5; i++) {
        const privateKey = await PrivateKey.randomKey();
        const privateWif = await privateKey.toWif();
        const pubkey = await PrivateKey.fromString(privateWif).toPublic().toString()
        keyPairs.push({ accName: randomAccountName(), publicKey: pubkey, privateKey: privateWif});
        await api.transact({
            actions: [{
                account: 'eosio',
                name: 'newaccount',
                authorization: [{
                    actor: 'eosio',
                    permission: 'active',
                }],
                data: {
                    creator: 'eosio',
                    name: keyPairs[i].accName,
                    owner: {
                        threshold: 1,
                        keys: [{
                            key: keyPairs[i].publicKey,
                            weight: 1
                        }],
                        accounts: [],
                        waits: []
                    },
                    active: {
                        threshold: 1,
                        keys: [{
                            key: keyPairs[i].publicKey,
                            weight: 1
                        }],
                        accounts: [],
                        waits: []
                    },
                },
            },
            {
                account: 'eosio',
                name: 'buyrambytes',
                authorization: [{
                    actor: 'eosio',
                    permission: 'active',
                }],
                data: {
                    payer: 'eosio',
                    receiver: keyPairs[i].accName,
                    bytes: 8192,
                },
            },
            {
                account: 'eosio',
                name: 'delegatebw',
                authorization: [{
                    actor: 'eosio',
                    permission: 'active',
                }],
                data: {
                    from: 'eosio',
                    receiver: keyPairs[i].accName,
                    stake_net_quantity: '100.0000 SCA',
                    stake_cpu_quantity: '1000000.0000 SCA',
                    transfer: false,
                }
            }]
        }, {
            blocksBehind: 3,
            expireSeconds: 30,
        });

        await api.transact({
            actions: [{
                account: 'eosio.token',
                name: 'transfer',
                authorization: [{
                    actor: 'eosio',
                    permission: 'active',
                }],
                data: {
                    from: 'eosio',
                    to: keyPairs[i].accName,
                    quantity: '1.0000 SCA',
                    memo: Math.random().toString().substr(2, 8)
                }
            }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            })
    };

    console.log("Generated keypairs, created accounts and provided them with funds, CPU and NET.");

    console.log("Writing keys to accounts.json file.")
    
    await fs.writeFileSync(`accounts.json`, JSON.stringify(keyPairs));

    process.exit();
};

setUpAccounts();
