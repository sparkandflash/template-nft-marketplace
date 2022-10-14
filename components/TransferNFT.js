import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { Box,  Button, Spacer, Input } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import axios from 'axios';

import Web3Modal from 'web3modal'

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function TransferNFT(nft) {
  const [formInput, updateFormInput] = useState({ Address: '' })
  const router = useRouter()
 
 
  const { Address } = formInput

  
 
  async function transferToken() {
 
  
    console.log(nft);

    console.log(nft.tokenId)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

  
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()


    console.log(listingPrice);
    try{
    const transaction = await contract.transferItem(nft.tokenId, Address)
    await transaction.wait().then(
    
    )

    
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
          placeholder="recevier address"
         
          onChange={e => updateFormInput({ ...formInput, Address: e.target.value })}
        />
 
     
<Spacer p={2}/>
        <Button  onClick={transferToken} >
         submit
        </Button>
</Box>
       

    </div>
  )
}