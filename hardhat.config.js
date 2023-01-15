require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";
const MUMBAI_PRIVATE_KEY = "";
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    /*
    mumbai: {
      // Infura
      url: `https://polygon-mumbai.g.alchemy.com/v2`,
    // url: "https://rpc-mumbai.matic.today",
      accounts: [``]
    },
    */
    georli: {
      url: "", //Infura url with projectId
      accounts: [`PRIVATE_KEY`] 
    /*
    matic: {
      // Infura
      // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [process.env.privateKey]
    }
    */
    ganache: {
      // Infura
      // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      url: "HTTP://LOCAL HOST ADDRESS",
      accounts: ['PRIVATE-KEY']
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
