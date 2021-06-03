export = {};
const Web3 = require('web3');
const net = require('net');
const web3 = new Web3(new Web3.providers.IpcProvider('/home/eth1/setup/net420/geth.ipc', net));
const fs = require('fs');

async function fundingAccounts() {
    // read addresses from accounts.json file
    console.log("Reading addresses from account.json.")
    var accounts: string[];
    try {
        const data = fs.readFileSync('accounts.json', 'utf8')
        accounts = JSON.parse(data);
    } catch (err) {
        throw new Error("Error when reading addresses. Did you set them up with 'set_up_accounts.ts'?");
    }
    // unlock Ether providing account
    console.log("Unlock account.")
    await web3.eth.personal.unlockAccount("0x1fc361c5Ec23Cb0eFF4186E3464d500ea8370049", "eth1", 10000);
    console.log("Providing Ether.")
    var i: number;
    for (i = 0; i < 4; i++) {
        web3.eth.sendTransaction({to: accounts[i], from: "0x1fc361c5Ec23Cb0eFF4186E3464d500ea8370049", value: web3.utils.toWei("0.5")});
    };
    // await until the last transaction is executed
    await web3.eth.sendTransaction({to: accounts[4], from: "0x1fc361c5Ec23Cb0eFF4186E3464d500ea8370049", value: web3.utils.toWei("0.5")});
    process.exit()
};

fundingAccounts();