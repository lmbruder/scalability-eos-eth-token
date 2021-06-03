export = {};
const Web3 = require('web3');
const net = require('net');
const web3 = new Web3(new Web3.providers.IpcProvider('/home/eth1/setup/net420/geth.ipc', net));
const fs = require('fs');

async function randomTransactions() {
  // read addresses from accounts.json file
  console.log("Reading addresses from account.json.")
  var accounts: string[];
  try {
    const data = fs.readFileSync('accounts.json', 'utf8')
    accounts = JSON.parse(data);
  } catch (err) {
    throw new Error("Error when reading addresses. Did you set them up with 'set_up_accounts.ts'?");
  }

  // unlock all accounts
  console.log("Unlocking accounts.")
  var i: number;
  for (i = 0; i < 5; i++) {
    await web3.eth.personal.unlockAccount(accounts[i], "pass", 10000);
  };

  // start transactions between accounts
  console.log("Initiating baseload with parameter 5 transactions per second.")
  console.log("Starting random transactions.")

  const startTime = Date.now()
  var count: number = 0;

  // send transactions every 200 milliseconds
  const setIntervalId = setInterval(() => {
    count++;
    var accountAddrs: string[] = accounts.slice();

    // chose random accounts
    const firstIndex = Math.floor(Math.random() * accountAddrs.length);
    const accountOne = accountAddrs[firstIndex];
    accountAddrs.splice(firstIndex, 1);
    const accountTwo = accountAddrs[Math.floor(Math.random() * accountAddrs.length)];

    // submit transactions from account one to account two
    web3.eth.sendTransaction({ to: accountOne, from: accountTwo, value: Math.floor(Math.random() * (20 - 1) + 1), gas: 30000 }, function (err, _) {
      if (err) {
        console.log("Error when trying to send transaction: " + err);
      };
    });
    if (Date.now() - startTime > (390 * 1000)) {
      clearInterval(setIntervalId);
      console.log("Count of transactions submitted as baseload during this trial: " + count)
      process.exit();
    };
  }, 200);
};

randomTransactions();