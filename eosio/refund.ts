export = {};
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
const fs = require('fs');


var privateKeys: any = ["5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3"];
var accountNames: any = [];

var accounts: any;
try {
  const data = fs.readFileSync('accounts.json', 'utf8')
  accounts = JSON.parse(data);
} catch (err) {
  throw new Error("Error when reading addresses. Did you set them up with 'set_up_accounts.ts'?");
}

accounts.forEach(key => {
  privateKeys.push(key.privateKey);
  accountNames.push(key.accName);
});

const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch }); //required to read blockchain state
const api = new Api({ rpc: rpc, signatureProvider: signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() }); //required to submit transactions


async function refundAccounts() {
    // stake CPU and NET for each account
    console.log("Staking CPU and NET.");
    accountNames.forEach(account => {
      (async () => {
        await api.transact({
          actions: [{
            account: 'eosio',
            name: 'delegatebw',
            authorization: [{
              actor: 'eosio',
              permission: 'active',
            }],
            data: {
              from: 'eosio',
              receiver: account,
              stake_net_quantity: '100.0000 SCA',
              stake_cpu_quantity: '100000.0000 SCA',
              transfer: false,
            }
          }]
        }, {
          blocksBehind: 3,
          expireSeconds: 30,
        });
      })();
    })
    process.exit()
};

refundAccounts();
