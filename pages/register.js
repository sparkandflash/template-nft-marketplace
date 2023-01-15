import { createClient } from '@supabase/supabase-js'
import * as IPFS from 'ipfs-core'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

 const supabase = createClient(supabaseUrl, supabaseAnonKey)
 import Header from '../components/Header';
 import { Container, Checkbox, HStack, Textarea,CheckboxGroup, Input, Button, VStack, Text, Box, Center } from "@chakra-ui/react";
 import { useEffect, useState } from "react";

 import { connectWallet, getCurrentWalletConnected } from "../utils/interact.js";

 import { useRouter } from 'next/router';

 export default function Register() {
     const [fileUrl, setFileUrl] = useState(null)
     const [formInput, updateFormInput] = useState({ role: false, name: '', address: '' })
     const [uploading, setUploading] = useState(false)
     const [walletAdd, setWallet] = useState("");
     const [user, setUser] = useState({ role: false, name: '', address: '' , fileUrl: '', wallet: '' });
     const [status, setStatus] = useState("");
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
 
                
 
                     <Text color="blue.100" fontSize="xl" fontWeight="bold" align="center">
                         Hello user! <br/>
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
 
                                     placeholder="bio"
 
                                     onChange={e => updateFormInput({ ...formInput, address: e.target.value })}
                                 />
                                 <Text color="blue.50" fontWeight="bold" mb='8px'>role:</Text>
                                 <Checkbox onChange={() => updateFormInput({ ...formInput, role: true })}>I am creator</Checkbox>
                               
                                 <Box p={2} width='fit-content'>
                                 <Button >add pfp</Button>
            <Text color='gray.200' >Ipfs service is being set up, pfp upload may not function</Text>


                                     <Text color="blue.50" fontWeight="bold" mb='8px'>upload pfp</Text>
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
