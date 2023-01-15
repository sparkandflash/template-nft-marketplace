import Header from '../components/Header';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Spacer,
  useDisclosure,
  Modal,
  Center,
  ModalCloseButton, Text, Container, Box, Button, Image
} from "@chakra-ui/react";
import { ethers } from 'ethers';
import axios from 'axios'

import { useEffect, useState } from "react";
import { useRouter } from 'next/router'
import ResellNFT from '../components/ResellNft';
import TransferNFT from '../components/TransferNFT';
//import TxnData from '../components/TxnData';
import Web3Modal from 'web3modal'
import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

export default function ItemProfile() {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);
  const [nft, setNft] = useState([])
  const [resellItem, setResellItem] = useState(true)
  const [recevier, setRecevier] = useState([])
  const { id, tokenURI } = router.query
  const { isOpen, onOpen, onClose } = useDisclosure()

  async function burnNft(nft) {
    setWaiting(true);
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const transaction = await contract.transferItem(nft.tokenId, "0x000000000000000000000000000000000000dEaD")
    await transaction.wait()
    setWaiting(false);
    console.log(transaction);
  }

  async function viewTxn(tokenId) {
    router.push(`https://georli.etherscan.io/token/0x97e33fff71b84a8a6a483a925d437cd7294f009c?a=${tokenId}`)
  }

  async function loadNFTs() {

    const EwasteItem = {
      price: null,
      tokenId: "",
      seller: "",
      owner: "",
      image: null,
      name: "",
      description: "",
      tokenURI
    }
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        tokenURI
      }
      if (item.tokenId == id) {
        EwasteItem = item;
      }
     
      return item
    }))

    setNft(EwasteItem);

  }
  function modalControltransfer() {
 
 
  setResellItem(false);
      onOpen();
    
 
   
  
  }
  function modalControlresell() {
 
 
    setResellItem(true);
        onOpen();
      
   
     
    
    }
  useEffect(() => {
    if (!id) { router.push(`/`) }
    loadNFTs()
  }, [])

  return (

    <div>
      <Header />
      <Container>
        <Box bg='gray.600' padding={3} m={1} rounded={6}>
          <Center>
            <Box w="fit-content" bg='gray.300' padding={3} m={1} rounded={6}>

              <Box w="280px" bg='gray.700' p={1} marginBottom='12px' rounded={6}>
                <Image rounded={6} boxSize='280px'
                  objectFit='cover' src={nft.image} />
              </Box>

              <Spacer />
              <Box width='280px' bg='gray.100' p={4} rounded={6}>
                <Text color='black.500'> {nft.name}  </Text>
                <Text color='black.500'> id -{nft.tokenId}  </Text>
                <p color='black.500'>desc- {nft.description}  </p>

                <Text isTruncated color='black.500'>seller - {nft.seller}  </Text>

                <Text color='black.500' padding={1}>Price - {nft.price} eth </Text>

              </Box>

            </Box>
          </Center>
          <Center>
     
              <Box  >
                <Button m={3} onClick={() => modalControlresell()}>
                  resell
                </Button>
                <Button m={3} onClick={() => modalControltransfer()}>
                  transfer
                </Button>
                <Button m={3} disabled={waiting} onClick={() => burnNft(nft)}>
                  burn
                </Button>
                <Button m={3} disabled={waiting} onClick={() => viewTxn(nft.tokenId)}>
                  ViewTxns
                </Button>
             </Box>


          </Center>
        </Box>




        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            {resellItem ? <ModalHeader >resell {nft.name} ? </ModalHeader> : <ModalHeader >Transfer {nft.name} ?</ModalHeader>}

            <ModalCloseButton />
            <ModalBody >
              {resellItem ? <ResellNFT   {...nft} /> : <TransferNFT {...nft} />}


            </ModalBody>
          </ModalContent>
        </Modal>

      </Container>
    </div>
  )
}
