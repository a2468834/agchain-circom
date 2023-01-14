// Packages
const ethers = require("ethers");
const hardhat = require("hardhat");


// Auxiliary function
async function getWalletObject(network_string) {
    const provider = new ethers.providers.StaticJsonRpcProvider(
        hardhat.config.networks[network_string].url
    );
    const wallet = new ethers.Wallet(
        hardhat.config.networks[network_string].accounts[0], 
        provider
    );
    
    return wallet;
}


// Main function
async function main() {
    if((process.argv).length !== 4) {
        const argv2 = "<network_name>"
        const argv3 = "<circuit_name>";
        console.error("Wrong argv!");
        console.error("\n[Example usage]");
        console.error(`$ node scripts/deploy.js ${argv2} ${argv3}\n`);
        process.exit(1);
    }
    
    const wallet   = await getWalletObject(`${process.argv[2]}`);
    
    const factory  = await hardhat.ethers.getContractFactory(
        `contracts/${process.argv[3]}_verifier.sol:Verifier`, 
        wallet
    );
    const contract = await factory.deploy();
    
    const txn_receipt = await contract.deployTransaction.wait(2);
    if(txn_receipt.status === 1) {
        console.log("Contract has been successfully deployed at:");
        console.log(contract.address);
    }
    else {
        console.log("Contract deployment is failed!\nPlease check txn hash:");
        console.log(txn_receipt.transactionHash);
    }
    
    console.log("\nDon't forget to upload codes to blockchain explorer:");
    console.log(`$ yarn hardhat verify --network ${process.argv[2]} ${contract.address}`);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });