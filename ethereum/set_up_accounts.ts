export = {};
const Web3 = require('web3');
const net = require('net');
const web3 = new Web3(new Web3.providers.IpcProvider('/home/eth1/setup/net420/geth.ipc', net));
const fs = require('fs');


async function setUpAccounts() {
    // set fromAddr that provides funds
    var args: string[] = process.argv.slice(2);
    var fromAddr: string;
    var password: string;

    if (args[0] == null) {
        throw new Error('No fund providing address was given.');
    } else if (args[1] == null) {
        throw new Error('No password for address was given.');
    } else {
        fromAddr = args[0];
        password = args[1];
    }

    await web3.eth.personal.unlockAccount(fromAddr, password, 10000)
    console.log("Account unlocked.");

    // create 5 accounts
    console.log("Creating accounts.")
    const addr1 = await web3.eth.personal.newAccount("pass");
    const addr2 = await web3.eth.personal.newAccount("pass");
    const addr3 = await web3.eth.personal.newAccount("pass");
    const addr4 = await web3.eth.personal.newAccount("pass");
    const addr5 = await web3.eth.personal.newAccount("pass");

    // provide Ether for each account
    console.log("Providing 1 Ether for each account.")
    const accounts: string[] = [addr1, addr2, addr3, addr4, addr5];
    var i: number;
    for (i = 0; i < 4; i++) {
        web3.eth.sendTransaction({to: accounts[i], from: fromAddr, value: web3.utils.toWei("1")});
    };
    // await until the last transaction is executed
    await web3.eth.sendTransaction({to: addr5, from: fromAddr, value: web3.utils.toWei("1")});

    fs.writeFileSync(`accounts.json`, JSON.stringify(accounts));

    console.log("Done.")
    process.exit()
};

setUpAccounts();
