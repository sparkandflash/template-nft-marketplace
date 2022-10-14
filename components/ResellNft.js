import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Box,  Button, Spacer, Input } from '@chakra-ui/react'
import { useRouter } from 'next/router'


import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function ResellNFT(nft) {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
 




  
 
  async function listNFTForSale() {
 
    if (!nft.price) return
    console.log(nft);
    console.log(formInput.price);
    console.log(nft.tokenId)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    console.log(priceFormatted);
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()


    console.log(listingPrice);
    try{
    const transaction = await contract.resellToken(nft.tokenId, priceFormatted, { value: listingPrice })
    await transaction.wait();
    router.push('/myProfile')
    
    }
    catch(err){
      console.log(err)
    }
    router.push('/myProfile')
  }
 


  return (
    <div >
  
<Box p={3} m={3}>
<Input 
          placeholder="Asset Price in Eth"
         
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
 
     
<Spacer p={2}/>
        <Button  onClick={listNFTForSale} >
          List NFT
        </Button>
</Box>
       

    </div>
  )
}