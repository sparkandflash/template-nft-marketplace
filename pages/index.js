import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { Text, Stack, Heading, Grid, GridItem, ButtonGroup, Center, useToast, Box, Button, Spacer, Image } from "@chakra-ui/react";
import axios from 'axios'
import Web3Modal from 'web3modal'
import Header from '../components/Header';
import { useRouter } from 'next/router'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const router = useRouter();
  const addToast = useToast();
  const [nfts, setNfts] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const [walletAddress, setWallet] = useState("");
  const [buyTxn, setBuyTxn] = useState({ event: "", price: "", from: "", to: "", data: "", hash: "", tokenid: "" })
  async function viewTxn(tokenId) {
    router.push(`https://rinkeby.etherscan.io/token/contract address=${tokenId}`)
  }
  async function checkNetwork() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await provider.getNetwork();
    const chainId = network.chainId;
    if (chainId != 4) {
      addToast({
        title: "Alert!.",
        description: "you are on wrong network, please connect to rinkeby network",
        status: "warning",
        duration: 9000,
        isClosable: true,
      })
    }

    else {
      console.log("connected to rinkeby network, chainid : 4")
    }


  }
  async function loadNFTs() {
    try {
      const provider = new ethers.providers.JsonRpcProvider("provider url like infura")

      //   const provider = new ethers.providers.JsonRpcProvider("HTTP://local host ip")

      const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
      const data = await contract.fetchMarketItems()

      const items = await Promise.all(data.map(async i => {
        const tokenUri = await contract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        }
        return item
      }))

      setNfts(items);
      //  newItem(items);
      setLoadingState('loaded')
    }
    catch (err) {
      addToast({
        title: "Alert!.",
        description: "there is some issue with fetching the items.",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
      console.log(err);

    }
  }

  async function buytxn() {

    try {
      const res = await fetch(
        '/api/add-txn-data',
        {
          body: JSON.stringify({ buyTxn }),
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          setTimeout: 10000
        }
      ).then(res => res.json())
        .then(data => {



          if (data == "success") {
            console.log("success")
          }
          else {
            console.log(data);

          };
        })
    }
    catch (ex) {

      console.log(ex)

    }

  }
  async function delistNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    try {
      setWaiting(true);
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

      /* user will be prompted to pay the asking proces to complete the transaction */

      const transaction = await contract.deListItem(nft.tokenId)
      await transaction.wait()
       
   
        loadNFTs(),
        addToast({
          title: "Alert!.",
          description: "delisting successful!",
          status: "success",
          duration: 9000,
          isClosable: true,
        })
       ,
        setWaiting(false)
    }
    catch (err) {
      console.log(err);
      setWaiting(false);
      addToast({
        title: "Alert!.",
        description: "delisting failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
    }
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    try {
      setWaiting(true);
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

      /* user will be prompted to pay the asking proces to complete the transaction */
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price
      })
      await transaction.wait()
        console.log(transaction.logs),setBuyTxn({ event: "SALE", price: JSON.stringify(price), from: nft.seller, to: walletAddress, date: new Date().toLocaleDateString(), hash: transaction.hash, tokenid: nft.tokenId }),
        console.log(buyTxn),
        buytxn(),
        loadNFTs(),
        addToast({
          title: "Alert!.",
          description: "Transacation successful!",
          status: "success",
          duration: 9000,
          isClosable: true,
        })
       ,
        setWaiting(false)
    }
    catch (err) {
      console.log(err);
      setWaiting(false);
      addToast({
        title: "Alert!.",
        description: "Transacation failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
    }
  }
  useEffect(async () => {

    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    // Prompt user for account connections
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setWallet(await signer.getAddress());
    checkNetwork();
    loadNFTs();
  }, [])
  if (loadingState === 'loaded' && !nfts.length) return (<div><Header /><h1>No Items listed</h1></div>)

  return (
    <div>
      <Header />
      <Box padding={5}>
        <Center>
          <Box rounded={6} width='max-content' border='1px' borderColor='gray.300' padding='15px'>

            <Grid templateColumns='repeat(3, 1fr)' gap={2}>
              {
                nfts.map((nft, i) => (
                  <div key={i}>

                    <Box w="fit-content" bg='gray.300' padding={3} m={1} rounded={6}>

                      <Box w="280px" bg='gray.700' p={1} marginBottom='12px' rounded={6}>
                        <Image rounded={6} boxSize='280px'
                          objectFit='cover' src={nft.image} />
                      </Box>

                      <Spacer />
                      <Box width='280px' key={i} bg='gray.100' p={4} rounded={6}>
                        <Text color='black.500'> {nft.name}  </Text>
                        <Text color='black.500'> id -{nft.tokenId}  </Text>
                        <p color='black.500'>desc- {nft.description}  </p>

                        <Text isTruncated color='black.500'>seller - {nft.seller}  </Text>

                        <Text color='black.500' padding={1}>Price - {nft.price} eth </Text>

                      </Box>

                      <ButtonGroup marginBlockStart={3} gap='2'>
                        <Button disabled={waiting} onClick={() => buyNft(nft)}>
                          buy
                        </Button>
                        <Button disabled={waiting} onClick={() => delistNft(nft)}>
                          delist
                        </Button>
                        <Button  disabled={waiting} onClick={() => viewTxn(nft.tokenId)}>
                          ViewTxns
                        </Button>
                        </ButtonGroup>


                    </Box>



                  </div>

                ))
              }
            </Grid>
          </Box>
        </Center>
      </Box>
    </div>
  )
}
