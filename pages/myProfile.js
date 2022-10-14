import {
    Box, Image, Modal,
    useToast, Button,  Grid, GridItem, Container, Heading, VStack, Center, Tag, Text
  } from '@chakra-ui/react'
  import Header from '../components/Header';
  
  import { ethers } from 'ethers';
  import axios from 'axios'
  import Web3Modal from 'web3modal';
  import { useEffect, useRef, useState } from "react";
  import { connectWallet, getCurrentWalletConnected } from "../utils/interact.js";
  import { useRouter } from 'next/router'
  
  import { supabase } from '../utils/supabaseClient'
  //display profile details.
  
  import {
    marketplaceAddress
  } from '../config'
  
  import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
  
  
  export default function MyProfile() {
  const [user, setUser] = useState({ role: 'false', name: '', address: '', pfp: '' })
    const addToast = useToast();
    const router = useRouter();
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    const [connected, setConnected] = useState("");
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
  
  
  
  
  
    async function loadNFTs() {
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      })
      try{  
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
          return item
        }))
        setNfts(items)
        setLoadingState('loaded')}
        catch (err)
        {
          console.log(err)
        }
  
    }
  
  
    const connectWalletPressed = async () => {
      try {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
        setConnected(true);
       
    
      }
      catch (err) {
        setConstatus(false);
       
      }
    };
   
  
    function addWalletListener() {
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setWallet(accounts[0]);
            setStatus("👆🏽 Write a message in the text-field above.");
          } else {
            setWallet("");
            setStatus("🦊 Connect to Metamask using the top right button.");
            window.localStorage.clear();
  
          }
        });
      } else {
        setStatus(
          <p>
            {" "}
            🦊{" "}
  
          </p>
        );
      }
    }
    function viewItem(nft) {
      console.log('nft:', nft)
      router.push(`/itemProfile?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
    }
    //if user is unregistered, that is, do an if else to check whther wallet address is stored in db or not
  
    async function checkNetwork(){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
  
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      if(chainId != 4) {
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
  
  
  
  
    // load data from chain/db for below variables
    async function isRegistered(walletadd) {
      try {
    
    
    
        let { data, error, status } = await supabase
          .from('users')
          .select(`name, address, citizen,pfp, walletAddress`)
          .eq('walletAddress', walletadd)
          .single()
    
        if (error && status !== 406) {
          throw error
        }
    
        if (!data) {
          router.push(`/register`)
        
        }
        else {
          console.log(data);
          setUser({role: data.citizen, name: data.name, address:data.address, pfp:data.pfp  })
  
          loadNFTs();
        }
          
        }
       catch (error) {
       
     
    }
    }
  
  
    useEffect(async () => {
      const { address, status } = await getCurrentWalletConnected();
      setWallet(address)
      setStatus(status);
      window.sessionStorage.setItem('address', walletAddress);
      window.localStorage.setItem('constatus', "true");
  
      console.log(walletAddress);
      address = JSON.stringify(address);
      isRegistered(address);
      checkNetwork();
      addWalletListener();
    
  
    }, []);
  
  
    if (loadingState === 'loaded' && !nfts.length) return (<div>  <Header />
    
  
      <Box padding={4}>
        <Box w='100%' borderRadius='lg' padding={5} borderWidth='1px'>
          <Center>
            <VStack padding={3}>
              <Image
                borderRadius='full'
                boxSize='150px'
                fallbackSrc='https://via.placeholder.com/150'
                src={user.pfp}alt='Dan Abramov' />
              <Text fontSize='md'>{user.name}</Text>
              {
                user.role ?  <Tag >citizen</Tag> : <Tag>user</Tag>
              }
             
  
  
            </VStack>
  
          </Center>
  
          <Text borderRadius='lg' borderWidth='1px' padding=" 10px" fontSize='md'>wallet address: {walletAddress}<br />bio : {user.address}</Text>
        </Box>
        <Container p={3}>
          <Center>
            <VStack>
              <Heading as='h5' size='sm'>
                items
              </Heading>
              <Button size='sm' disabled= {!user.role} colorScheme="blue" onClick={() => router.push('/citizen')}>add item</Button>
              <Box>
                <Text p={2}>Items owned: {nfts.length} Items bought: {nfts.length}</Text>
              </Box>
              <Text>No Items available</Text>
            </VStack>
  
  
  
          </Center>
         
          
  
        </Container>
      </Box>
      
  
  
  
    
  </div>)
  
    return (
      <div>
        <Header />
        {!connected ?
        <Container p={5} h="500px" maxW="container.lg" centerContent='true'>
  
        <Box m="auto" shadow="lg" p={4} opacity="90%" blur="3px" bg="blue.300" rounded="10px" h="350px">
  
          <Box h="90px" p={3}>
  
            <Text color="black.500" fontSize="2xl" fontWeight="bold" align="center">
              welcome user
            </Text>
            <Center h="40">
              <VStack>
  
  
                <Button size="lg" onClick={() => connectWalletPressed()}>Connect</Button>
              </VStack>
  
            </Center>
  
            <Text color="black.300" fontSize="md" align="center">
              use your browser wallet extension to connect to the D-app
            </Text>
          </Box>
  
  
        </Box>
  
  
      </Container>
  :
  
          <Box padding={4}>
            <Box w='100%' borderRadius='lg' padding={5} borderWidth='1px'>
              <Center>
                <VStack padding={3}>
                  <Image
                    borderRadius='full'
                    boxSize='150px'
                    fallbackSrc='https://via.placeholder.com/150'
                    src={user.pfp}alt='Dan Abramov' />
  
                  <Text fontSize='md'>{user.name}</Text>
                  <Tag visibility={user.role}>citizen</Tag>
  
  
                </VStack>
  
              </Center>
  
              <Text borderRadius='lg' borderWidth='1px' padding=" 10px" fontSize='md'>wallet address: {walletAddress}<br />bio : {user.address}</Text>
            </Box>
            <Container p={3}>
              <Center>
                <VStack>
                  <Heading as='h5' size='sm'>
                    items
                  </Heading>
                  <Button size='sm' disabled= {!user.role} colorScheme="blue" onClick={() => router.push('/citizen')}>add item</Button>
                  <Box>
                    <Text p={2}>Items owned: {nfts.length} Items bought: {nfts.length}</Text>
                  </Box>
               
              <Box rounded={6} width='max-content' border='1px' borderColor='gray.300' padding='15px'>
              <Grid templateColumns='repeat(4, 1fr)' gap={2}>
              {
                nfts.map((nft, i) => (
                  <GridItem key={i}>
                    
                      <Box w="250px" bg='gray.300' padding={3} rounded={6}>
  
                          <Image rounded={5} boxSize='250px'
                            objectFit='cover' src={nft.image} />
                       
                       
                       <Box bg='gray.400'  rounded={6} marginBlockStart={3} marginBlockEnd={3} p={3}>
                       <Text color='black.500'> {nft.name}  </Text>
                       <Text color='black.500'> {nft.tokenId}  </Text>
                          <p color='black.500'>desc- {nft.description}  </p>
  
  
                          <Text isTruncated color='black.500'>owner- {nft.owner}  </Text>
                          <Text color='black.500' padding={1}>Price - {nft.price} eth </Text>
                       </Box>
  
                     
  
                          <Button onClick={() => viewItem(nft)}>
                          view
                        </Button>
  
                      </Box>
                      
  
  
                      
                      
                   
                  </GridItem>
  
                ))
              }
  </Grid>
              </Box>
              </VStack>
  
  
  
  </Center>
            </Container>
          </Box>
          
          
  
  
        }
      </div>
    )
  }
  //items before container end tag
  