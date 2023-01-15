import { Textarea, Input, Button, Image, VStack, Text, Box, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
var randomstring = require("randomstring");
import { ethers } from 'ethers'

import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import * as IPFS from 'ipfs-core'
// const client = ipfsHttpClient('https://api.filebase.io/v1/ipfs')

import {
    marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'



function CreateItem() {
  //  const [fileName, setFileName] = useState("")
    const [uploading, setUploading] = useState(false)
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const router = useRouter()

    async function onChange(e) {
        const node = await IPFS.create();
        setUploading(true);
        const file = e.target.files[0]
        try {
            const fileAdded = await node.add({
                path: randomstring.generate(6),
                progress: (prog) => console.log(`received: ${prog}`),
                content: file
            }
            );

            console.log("Added file:", fileAdded.path, fileAdded.cid.toString());
            const url = `https://ipfs.io/ipfs/${fileAdded.cid.toString()}`
            setFileUrl(url)
            setUploading(false);
        } catch (error) {
            console.log('Error uploading file: ', error)

        }
    }
    async function uploadToIPFS() {
        const node = await IPFS.create();
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return
        /* first, upload to IPFS */
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try {
            const fileAdded = await node.add({
                path: randomstring.generate(6),
                progress: (prog) => console.log(`received: ${prog}`),
                content: data
            }
            );
            console.log("Added file:", fileAdded.path, fileAdded.cid.toString());
            const url = `https://ipfs.io/ipfs/${fileAdded.cid.toString()}`

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
                    Hello citizen!
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
