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

async function randomTransactions() {
  // start transactions between accounts
  console.log("Initiating baseload with parameter 100 transactions per second.");
  console.log("Starting random transactions.")

  // send transactions every interval milliseconds
  var count = 0;
  var startTime = Date.now();
  const setIntervalId = setInterval(() => {
    count++;
    var accounts: string[] = accountNames.slice();

    const firstIndex = Math.floor(Math.random() * accounts.length);
    const accountOne = accounts[firstIndex];
    accounts.splice(firstIndex, 1);
    const accountTwo = accounts[Math.floor(Math.random() * accounts.length)];

    api.transact({
      actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: accountOne,
          permission: 'active',
        }],
        data: {
          from: accountOne,
          to: accountTwo,
          quantity: '0.0001 SCA',
          memo: Math.random().toString().substr(2, 8)
        }
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });
    if (Date.now() - startTime > (300 * 1000)) {
      clearInterval(setIntervalId);
      console.log("Count of transactions submitted as baseload during this trial: " + count)
      process.exit();
    };
  }, 5);
};

randomTransactions();