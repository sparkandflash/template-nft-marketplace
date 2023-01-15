
import {
    FormControl, Flex, Spacer,ButtonGroup, Heading, Input, FormLabel, Text, Button, Box, Stack, VStack
} from "@chakra-ui/react"
import { useEffect, useState } from "react";
//import ServiceSearch from '../components/ServiceSearch';
import { useRouter } from 'next/router'
//make a function to check whether wallet connected, if yes -> show the disconnect button else dont show
//<Button size= "lg">disconnect</Button>
function Header() {

    const router = useRouter()
  

    return (

        <header>
            <Flex margin="6px"  minWidth='max-content' alignItems='center' gap='2' p={2}>
            <Box p='2'>
    <Heading size='md'>generic nft marketplace</Heading>
  </Box>
  <Spacer />
  <ButtonGroup gap='2'>
                <Button size='sm' colorScheme="blue" onClick={() => router.push('/')}>home</Button>
                <Button size='sm' colorScheme="blue" onClick={() => router.push('/myProfile')}>my profile</Button>
               
              { /* <Button size='sm' colorScheme="blue"  onClick={() => router.push('/register')}>login</Button>
                <Button size='sm' colorScheme="blue" >logout</Button> */}
               </ButtonGroup> 
                
                
            </Flex>



        </header>
    )
}
export default Header
