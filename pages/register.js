import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

 const supabase = createClient(supabaseUrl, supabaseAnonKey)
 import Header from '../components/Header';
 import { Container, Checkbox, HStack, Textarea,CheckboxGroup, Input, Button, VStack, Text, Box, Center } from "@chakra-ui/react";
 import { useEffect, useState } from "react";

 import { connectWallet, getCurrentWalletConnected } from "../utils/interact.js";
 import { create as ipfsHttpClient } from 'ipfs-http-client'
 import { useRouter } from 'next/router';
 const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
 export default function Register() {
     const [fileUrl, setFileUrl] = useState(null)
     const [formInput, updateFormInput] = useState({ role: false, name: '', address: '' })
     const [uploading, setUploading] = useState(false)
     const [walletAdd, setWallet] = useState("");

     const [status, setStatus] = useState("");
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
    
     async function setProfile(formInput) {
         try {
           setUploading(true)
        
     
           const updates = {
             name: formInput.name,
             address : formInput.address,
             citizen: formInput.role,
             pfp : fileUrl,
             walletAddress : walletAdd,
           }
     
           let { error } = await supabase.from('users').upsert(updates, {
             returning: 'minimal', // Don't return the value after inserting
           })
     
           if (error) {
             throw error
           }
           router.push(`/myProfile`)
         } catch (error) {
           alert(error.message)
         } finally {
           setUploading(false)
         }
       } 
 
      
       useEffect(async () => {
         const { address, status } = await getCurrentWalletConnected();
         setWallet(address)
         setStatus(status);
         
         console.log(walletAdd);
     
       }, []);
 
     return (
         <div>
 
 <Header />
 <Container p={5}  h="500px" maxW="container.lg" centerContent='true'>
       
             <Box m="auto" shadow="lg" p={4} opacity="90%" blur="3px" bg="blue.500" rounded="10px" h="max-content">
 
                
 
                     <Text color="blue.100" fontSize="2xl" fontWeight="bold" align="center">
                         Hello citizen! <br/>
                         {walletAdd}
                     </Text>
                     <Center height='max-content'>
                         <VStack>
 
                             <form>
                                 <Text color="blue.50" fontWeight="bold" mb='8px'>user name:</Text>
                                 <Input
                                     placeholder="User Name"
 
                                     onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                                 />
                                 <Text color="blue.50" fontWeight="bold" mb='8px'>bio:</Text>
                                 <Textarea
 
                                     placeholder="user address"
 
                                     onChange={e => updateFormInput({ ...formInput, address: e.target.value })}
                                 />
                                 <Text color="blue.50" fontWeight="bold" mb='8px'>role:</Text>
                                 <Checkbox onChange={() => updateFormInput({ ...formInput, role: true })}>citizen?</Checkbox>
                               
                                 <Box p={2} width='fit-content'>
                                     <Text color="blue.50" fontWeight="bold" mb='8px'>upload file</Text>
                                     <Input
                                         type="file"
                                         name="Asset"
 
                                         onChange={onChange}
                                     />
                                     <Text color="blue.50" fontWeight="bold" mb='8px'>user pfp:</Text>
                                     
                                 </Box>
 
 
 
                                 <Button       onClick={() =>setProfile(formInput)}
       disabled={ uploading}
 size="md">submit</Button>
                             </form>
                         </VStack>
                     </Center>
 
 
                 </Box>
 
 
 
          </Container>
 
 
         </div>
     )
 }