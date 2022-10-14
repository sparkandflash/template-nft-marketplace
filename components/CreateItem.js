import { Textarea, Input, Button, Image, VStack, Text, Box, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
    marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

function CreateItem() {
    const [uploading, setUploading] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    async function onChange(e) {
        setUploading(true);
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
            setUploading(false);
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }
    async function uploadToIPFS() {
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return
        /* first, upload to IPFS */
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            /* after file is uploaded to IPFS, return the URL to use it in the transaction */

            return url
        } catch (error) {
            console.log('Error uploading file: ', error)
        }
    }

    async function listNFTForSale() {
        const url = await uploadToIPFS()
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        /* next, create the item */
        const price = ethers.utils.parseUnits(formInput.price, 'ether')


        try {
            let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
            let listingPrice = await contract.getListingPrice()
            listingPrice = listingPrice.toString()
            let transaction = await contract.createToken(url, price, { value: listingPrice })


            const receipt = await transaction.wait()
            console.log(receipt)
          //get hash first then obtain receipt from it, then get token id
          console.log(transaction.hash);
          console.log(transaction.logs);
        }
        catch (err) {
            console.log(err)
        }

        router.push('/')
    }

    return (
        <div>



            <Box m="auto" shadow="lg" p={4} opacity="90%" blur="3px" bg="blue.500" rounded="10px" h="max-content">



                <Text color="blue.100" fontSize="2xl" fontWeight="bold" align="center">
                    Hello user!
                </Text>
                <Center height='max-content'>
                    <VStack>

                        <form>
                            <Text color="blue.50" fontWeight="bold" mb='8px'>Item name:</Text>
                            <Input
                                placeholder="Asset Name"

                                onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                            />
                            <Text color="blue.50" fontWeight="bold" mb='8px'>description:</Text>
                            <Textarea

                                placeholder="Asset Description"

                                onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                            />
                            <Text color="blue.50" fontWeight="bold" mb='8px'>price:</Text>
                            <Input
                                placeholder="Asset Price in Eth"

                                onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                            />
                            <Box p={2} width='fit-content'>
                                <Text color="blue.50" fontWeight="bold" mb='8px'>upload file</Text>
                                <Input
                                    type="file"
                                    name="Asset"

                                    onChange={onChange}
                                />
                                <Text color="blue.50" fontWeight="bold" mb='8px'>item Picture:</Text>
                                {
                                    fileUrl && (
                                        <Image borderRadius={6} boxSize='350px'
                                            objectFit='cover'
                                            src={fileUrl} />
                                    )
                                }
                            </Box>



                            <Button disabled={uploading} onClick={listNFTForSale} size="md">submit</Button>
                        </form>
                    </VStack>
                </Center>


            </Box>






        </div>
    )
}

export default CreateItem