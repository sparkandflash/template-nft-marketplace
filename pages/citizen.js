import Header from '../components/Header';
import {  Container, Button, VStack,Text, Box, Center } from "@chakra-ui/react";
import CreateItem from '../components/CreateItem';
function newItem() {

    return (
        <div>
            <Header/>
            <Container p={5}  h="500px" maxW="container.lg" centerContent='true'>
      
     

       
          <Center >
          <VStack>
           
          <CreateItem />
          </VStack>
          </Center>
          
          <Text color="gray.300" fontSize="md" align="center">
          upon submitting, sign the incoming transaction on your wallet.
          </Text>
      

       

   
    </Container>
        </div>
    )
}

export default newItem