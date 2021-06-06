export = {};
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');      // development only
const fetch = require('node-fetch');                                    // node only; not needed in browsers
const { TextEncoder, TextDecoder } = require('util');                   // node only; native TextEncoder/Decoder
const fs = require('fs');

class submit {
  txHash: string;
  timestamp: number;
  index: number;
}

class block {
  txHashes: string[];
  blocknumber: number;
  blockTimestamp: number;
}

class balanceChange {
  timestamp: number;
  amount: number;
}

class Trial {
  public duration: number;
  public txPerSec: number;
  public baseLoad: number;
  public privateKeys: string[] = [];
  public accountNames: string[] = [];
  public fromAcc: string;
  public toAcc: string;
  public rpc: any;
  public api: any;
  public startTime: number;
  public submits: submit[] = [];
  public readyForTrial: boolean = false;
  public balanceChanges: balanceChange[] = [];
  public blocknumbers: number[] = [];


  constructor(privateKey: string, fromAcc: string, toAcc: string) {
    this.privateKeys.push(privateKey);
    this.fromAcc = fromAcc;
    this.toAcc = toAcc;
  };

  setUp() {
    const signatureProvider = new JsSignatureProvider(this.privateKeys);
    this.rpc = new JsonRpc('http://127.0.0.1:8888', { fetch }); //required to read blockchain state
    this.api = new Api({ rpc: this.rpc, signatureProvider: signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() }); //required to submit transactions
  };

  async startTrial() {
    var currentBalance: number;
    await this.rpc.get_currency_balance('eosio.token', 'eosio', 'SCA').then(function (value) {
      currentBalance = Number(String(value).slice(0, value.length - 4));
    });
    console.log("Current token balance of token owner is " + currentBalance + ".");

    console.log("Trial was started.")
    this.startTime = Date.now();
    var interval: number = 1000 / this.txPerSec;
    this.checkBalanceChange();

    var count: number = 0;

    // send transactions every interval milliseconds
    var txIntervalId = setInterval(() => {
      const time: number = Date.now();
      this.api.transact({
        actions: [{
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{
            actor: 'eosio',
            permission: 'active',
          }],
          data: {
            from: 'eosio',
            to: 'eosnode2',
            quantity: '1.0000 SCA',
            memo: Math.random().toString().substr(1, 10)
          }
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then((value) => {
        count += 1;
        this.submits.push({ txHash: value.transaction_id, timestamp: time, index: count });
        this.blocknumbers.push(value.processed.block_num);
      }).catch(err => console.log(err));

      if (Date.now() - this.startTime > (this.duration * 1000)) {
        clearInterval(txIntervalId);
      };

    }, interval);
  };

  async checkBalanceChange() {
    console.log("Looking for balance changes.")
    const getBaseValue = await this.rpc.get_currency_balance('eosio.token', 'eosnode2', 'SCA');
    // reformat return value
    const baseValue = Number(String(getBaseValue).slice(0, getBaseValue.length - 4));
    var startValue = baseValue;
    console.log("Start value: " + baseValue)

    while (Date.now() - this.startTime < ((this.duration) * 8000)) {
      const getNewValue = await this.rpc.get_currency_balance('eosio.token', 'eosnode2', 'SCA');
      const newValue = Number(String(getNewValue).slice(0, getNewValue.length - 4));
      if (startValue != newValue) {
        console.log("Balance changed. Now: " + newValue);
        const tokensAdded = newValue - baseValue
        this.balanceChanges.push({ timestamp: Date.now(), amount: tokensAdded });
        startValue = newValue;
      };
    };

    this.getResults();
  };

  // write results to files in "results" folder
  async getResults() {
    console.log("Getting data results.")

    const newDir: string = `./results/sub${this.txPerSec}_dur${this.duration}_base${this.baseLoad}_${Date.now()}`;
    if (!(fs.existsSync(newDir))) {
      fs.mkdirSync(newDir, { recursive: true }, (err) => {
          if (err) {
              throw err;
          };
          console.log("Results directory is created.");
      });
    };

    // get all blocks that contain submitted transactions and add them to list if they have not been added
    var blocks: block[] = [];
    var allTxBlocks: number[] = [];
    var i: number;
    for (i = 0; i < this.blocknumbers.length; i++) {
      var alreadyAdded = false;
      blocks.forEach(el => {
        if (el.blocknumber == this.blocknumbers[i]) {
          alreadyAdded = true;
        };
      });

      if (!alreadyAdded) {
        const block = await this.rpc.get_block(this.blocknumbers[i]);
        var hashes: string[] = [];
        allTxBlocks.push(block.transactions.length);
        block.transactions.forEach(transaction => {
          hashes.push(transaction.trx.id);
        });

        blocks.push({
          txHashes: hashes,
          blockTimestamp: new Date(block.timestamp).getTime() / 1000.0,
          blocknumber: this.blocknumbers[i]
        });
      };
    };

    var submitTxHashes: string[] = [];
    this.submits.forEach(submit => {
      submitTxHashes.push(submit.txHash);
    });

    class blockResult {
      timestamp: number;
      amountTx: number;
    }

    // add blocks with cumulative amount of transactions to list
    var count: number = 0;
    var blockResults: blockResult[] = [];
    var relevant: boolean;
    blocks.forEach(block => {
      block.txHashes.forEach(hash => {
        if (submitTxHashes.includes(hash)) {
          relevant = true;
          count += 1;
        };
      });
      if (relevant) {
        blockResults.push({ timestamp: block.blockTimestamp, amountTx: count })
      };
      relevant = false;
    });

    fs.writeFileSync(`${newDir}/submits.json`, JSON.stringify(this.submits));
    fs.writeFileSync(`${newDir}/blocks.json`, JSON.stringify(blockResults));
    fs.writeFileSync(`${newDir}/allTxBlocks.json`, JSON.stringify(allTxBlocks));
    fs.writeFileSync(`${newDir}/balanceChanges.json`, JSON.stringify(this.balanceChanges));

    console.log("Done.");
    process.exit();
  };
};

function main() {
  const trial = new Trial(
    "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3", // private key of fromAddr
    "eosio",                                               // account name
    "eosnode2"                                             // receiving account
  );

  // catch arguments passed to 
  var args: string[] = process.argv.slice(2);

  // check if all necessary arguments were provided
  if (args[0] == null) {
    throw new Error('Duration in seconds was not provided.');
  } else if (args[1] == null) {
    throw new Error('Transactions per second parameter was not provided.');
  } else {
    trial.duration = Number(args[0]);
    trial.txPerSec = Number(args[1]);
  };

  if (args[2] == null) {
    trial.baseLoad = 0;
  } else {
    trial.baseLoad = Number(args[2]);
  };

  trial.setUp();
  trial.startTrial();
};

main();