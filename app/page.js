"use client"
import {Box, Typography, Button} from "@mui/material"
import Stack from '@mui/material/Stack';
import {firestore} from "@/firebase"
import { collection, query, getDocs, setDoc, doc, deleteDoc, getDoc  } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { generateRecipes } from "./action";
import { green } from "@mui/material/colors";



const style = {
  position: "absolute",
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};







export default function Home() {


  function handleInputChange(event) {
    setItems(event.target.value);
    console.log(event.target.value)
     }
    

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [items, setItems] = useState("")
  const [pantry, setPantry] = useState([])
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const inputRef = useRef()
  
  const onSubmit = async () => {
    try {
      let r = await generateRecipes(pantry);
      console.log(r);
      setRecipes(r);
      
    } catch (error) {
      console.error("Error generating recipes:", error);
    }
  };
  

  const filteredItems = pantry.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  




 
  
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
    
    pantryList.push({name: doc.id, ...doc.data()})
   })
   console.log(pantryList)
   setPantry(pantryList)
    }
  
  useEffect(() => {
   
  updatePantry()
  },[])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    const value = inputRef.current.value
    if(value === "") return
    if (docSnap.exists()) {
        const {count} = docSnap.data()
        await setDoc(docRef, {count: count + 1})
       
        setItems("")
        return
    }
    else {
      await setDoc(docRef, {count: 1})
      setItems("")
   
     
    }

    inputRef.current.value = ""

    await updatePantry()
   

  }

  const DeleteItem = async (item) => {
    const docRef = doc(firestore, 'pantry', item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {count} = docSnap.data()
      if(count === 1) {
      await deleteDoc(docRef)
      }
      else {
          await setDoc(docRef, {count: count -1})
      }
     await updatePantry ()
  }
 
 

  }

  return (
   
    <Box width = "100vw" height = "100vh" display = {'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'} gap = {2}   >
      <Box justifyContent={"space-between"}>
      <TextField id="outlined-basic" ref = {inputRef} label="Search" variant="outlined" minheight = "10px" value = {searchQuery} onChange={e => setSearchQuery(e.target.value)}   sx={{
      width: '800px',
      minheight: '10px'
    }}/>
     
     </Box>
      <Button variant="contained" onClick={handleOpen}>Add</Button>
      <Modal
  open={open}
  onClose={handleClose}
  aria-labelledby="modal-modal-title"
  aria-describedby="modal-modal-description"
>
  <Box sx={style}>
  <Typography variant={"h6"} color = {"#333"}   >
    Add Items
  </Typography>
  <Stack direction={"row"} spacing={2} >
  <TextField id="outlined-basic" label="Add" variant="outlined" minheight = "10px" value = {items} onChange={handleInputChange} ref = {inputRef} />
  <Button variant="outlined" minheight = "10px"  onClick = {() => {
      addItem(items)

  }} >Add</Button>
  </Stack>
  </Box>
</Modal>
      <Box border = {'1px solid #333'}>
      
      <Box width = "800px" height = "100px" bgcolor={'f0f0f0'} textAlign={'center'}  >
      <Typography variant={"h2"} color = {"#333"} textAlign={'center'}  >
        Pantry Items
        </Typography>
      
  
      </Box>
    
      <Stack width = "800px" height = "200px" spacing = {2} overflow= {'auto'} >
     {filteredItems.map(({name, count}) => (
      
    <Box width = "100%" minheight = "150px" display = {'flex'}  alignItems={"center"} bgcolor={"forestgreen"} key={name}
    style={{ justifyContent: 'space-between' }}

   >
    
      <Typography variant={"h3"} color = {"#333"} textAlign={'center'}  >
      {
      name
      }
</Typography>
<Typography variant={"h3"} color = {"#333"} textAlign={'center'}  >
     Quantity:  {count}
</Typography>

<Button variant="contained" onClick = {() => DeleteItem(name)}>Delete</Button>
</Box>

     ))}
      </Stack>
      

  
  
  </Box>
  <Button variant="contained" onClick = {onSubmit}>Generate Recipe</Button>
      <Stack width="800px" height="200px" spacing={2} overflow="auto"  direction={"column"} color={green} >
    { recipes.length > 0 && 
        recipes.map((recipe, index) => (
    <Box
      width="100%"
      minHeight="150px"
      display="flex"
      alignItems="center"
      bgcolor="forestgreen"
      key={index}
      style={{ justifyContent: 'space-between' }}
    >
      <Typography variant="h5" color="#333" textAlign="center">
        {recipe.name}
      </Typography>
      <Typography variant="h7" color="#333" textAlign="center">
        {recipe.description}
      </Typography>
     
     
    </Box>
  ))}
</Stack>

    </Box>
  );
}
