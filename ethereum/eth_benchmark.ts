export = {};
const Web3 = require('web3');
const net = require('net');
const web3 = new Web3(new Web3.providers.IpcProvider('/home/eth1/setup/net420/geth.ipc', net));
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
  public fromAddr: string;
  public password: string;
  public toAddr: string;
  public contractAddr: string;
  public readyForTrial: boolean = false;
  public submits: submit[] = [];
  public blocks: block[] = [];
  public balanceChanges: balanceChange[] = [];
  public startTime: number;
  public sig: any;
  public tokenContract: any;

  constructor(fromAddr: string, password: string, toAddr: string, contractAddr: string) {
    this.fromAddr = fromAddr;
    this.password = password;
    this.toAddr = toAddr;
    this.contractAddr = contractAddr;
  };

  setUp() {
    // set contract address and abi
    const contractAbi: any = {
      "abi": [
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "initialSupply",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            }
          ],
          "name": "allowance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [
            {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "subtractedValue",
              "type": "uint256"
            }
          ],
          "name": "decreaseAllowance",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "addedValue",
              "type": "uint256"
            }
          ],
          "name": "increaseAllowance",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "transfer",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "sender",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    }
    const abi: any = contractAbi["abi"];

    // prepare transactions
    this.tokenContract = new web3.eth.Contract(abi, this.contractAddr);
    this.sig = this.tokenContract.methods.transfer(this.toAddr, 1).encodeABI();

    // unlock account 
    web3.eth.personal.unlockAccount(this.fromAddr, this.password, 10000);
    console.log("Account unlocked.");
  };

  async startTrial() {
    const currentBalance = await this.tokenContract.methods.balanceOf(this.fromAddr).call();
    console.log("Current token balance of token owner is " + currentBalance + ".");

    console.log("Trial was started.")

    this.startTime = Date.now();
    var interval: number = 1000 / this.txPerSec;
    this.checkBalanceChange();

    var count: number = 0;

    // send transactions every interval milliseconds
    var setIntervalId = setInterval(() => {
      // send transaction and push hash and timpestamp to array
      web3.eth.sendTransaction({ to: this.contractAddr, from: this.fromAddr, data: this.sig }, (err, txHash) => {
        count += 1;
        const time: number = Date.now();
        if (!err) {
          this.submits.push({ txHash: txHash, timestamp: time, index: count });
        } else {
          throw new Error('Error when trying to send transaction.');
        }
      });

      if (Date.now() - this.startTime > (this.duration * 1000)) {
        clearInterval(setIntervalId);
      };
    }, interval);
  };


  // track timestamps of balance changes
  async checkBalanceChange() {
    console.log("Looking for balance changes.")
    const baseValue = await this.tokenContract.methods.balanceOf(this.toAddr).call();
    var startValue = baseValue;
    console.log("Start value: " + baseValue)

    while (Date.now() - this.startTime < ((this.duration) * 12000)) {
      var newValue = await this.tokenContract.methods.balanceOf(this.toAddr).call();
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
    var submitTxHashes: string[] = [];
    var allTxBlocks: number[] = [];

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

    var i: number;
    for (i = 0; i < this.submits.length; i++) {
      const txHash = this.submits[i].txHash;
      const tx = await web3.eth.getTransaction(txHash);
      const block = await web3.eth.getBlock(tx.blockNumber);
      const blockObject = { txHashes: block.transactions, blocknumber: tx.blockNumber, blockTimestamp: block.timestamp };

      var alreadyAdded = false;
      this.blocks.forEach(el => {
        if (el.blocknumber == blockObject.blocknumber) {
          alreadyAdded = true;
        };
      });

      if (!alreadyAdded) {
        this.blocks.push(blockObject);
        allTxBlocks.push(block.transactions.length);
      }
    };

    class blockResult {
      timestamp: number;
      amountTx: number;
    }

    var count: number = 0;
    var blockResults: blockResult[] = [];
    var relevant: boolean;
    this.blocks.forEach(block => {
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
    fs.writeFileSync(`${newDir}/balanceChanges.json`, JSON.stringify(this.balanceChanges));
    fs.writeFileSync(`${newDir}/allTxBlocks.json`, JSON.stringify(allTxBlocks));

    console.log("Done.");
    process.exit();
  };

};

function main() {
  const trial = new Trial(
    "0x1fc361c5Ec23Cb0eFF4186E3464d500ea8370049",  // address that owns the tokens
    "eth1",                                        // password of this address
    "0xefcedb7dcf97bfe7d5564f295f6a073a5928b1ac",  // address that should receive the tokens
    "0x322962A1460cf2d1b1a1a362A46F6f32e889b0fb"   // token contract address
  );

  // catch passed arguments
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