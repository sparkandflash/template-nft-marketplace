## Full stack NFT marketplace built with rinkeby, Solidity,  infura IPFS, & Next.js

# [IPFS function is unavilable]
- the infura gateways i used were free ones, now they are no longer free :/ I'm in process of setting up an alternative.
- https://g-nft-mrkt.sparkandflash.art/ - Running example


this project uses ethers, chakra ui, nextjs. solidity NFT Marketplace contract.
## notion page with links to tutorials and documenations of various libraries used: 
https://sparkandflash.notion.site/final-year-project-db550c28dce34924b1a6bc741576db33

To run this project locally, follow these steps.

required softwares: 
- nodejs 
- vs code
- ganche (optional) 
- metamaask preinstalled and set up on chrome/mozilla/brave browser on desktop, this project is not optmised for smartphones. it might work to some extent on opera crypto browser on tablets. obtain Goerli tokens. 


clone this repo on vs code and open the folder of the extracted site

# confrim node is installed 
```sh
node -v
```
```sh
npm -v
```


# install using NPM 
```sh
npm install

```

2. Start the local Hardhat node (this contract is already deployed on Goerli network, confirm network setting in hardhat config file before deploying to localhost)

```sh
npx hardhat node
```
## import an account from local host network which has preassigned testnet tokens to metamask 

![Screenshot from 2022-07-15 19-15-54](https://user-images.githubusercontent.com/47806016/179236032-5559f539-38e9-46fb-91f4-cf089eeeace6.png)

3. With the network running, deploy the contracts to the local network in a separate terminal window

```sh
npx hardhat run scripts/deploy.js --network localhost 
```
if deploying to other networks: 
```sh
npx hardhat run scripts/deploy.js --network name(Goerli/mumbai/mainnet/matic/ganache) 
```

4. Start the app (verify rpc url, its different for local host and other networks ) 

```
npm run dev
```


### Configuration

To deploy to Polygon test or main networks, update the configurations located in __hardhat.config.js__ to use a private key and, optionally, deploy to a private RPC like Infura.

```javascript
require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const privateKey = fs.readFileSync(".secret").toString().trim() || "01234567890123456789";

// infuraId is optional if you are using Infura RPC
const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      // Infura
      // url: `https://polygon-mumbai.infura.io/v3/${infuraId}`
      url: "https://rpc-mumbai.matic.today",
      accounts: [privateKey]
    },
    matic: {
      // Infura
      // url: `https://polygon-mainnet.infura.io/v3/${infuraId}`,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey]
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
```


url is obtained from ganche app when local blockchain is started.
also change network in metmask to testnet (rinkeby) or to localhost or to ganache.
If using Infura, update __.infuraid__ with your [Infura](https://infura.io/) project ID.

