require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
    solidity: {
        version: "0.6.11",
        settings: {
            optimizer: {
                enabled: false
            }
        },
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    },
    networks: {
        goerli: {
            url: process.env.Goerli,
            accounts: [process.env.PriKey]
        },
        optimism: {
            url: process.env.Optimism,
            accounts: [process.env.PriKey]
        }
    },
    etherscan: {
        apiKey: {
            goerli: process.env.Etherscan,
            optimisticGoerli: process.env.OptimismScan
        }
    }
};
