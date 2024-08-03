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
import {Camera} from "react-camera-pro";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';



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


const style1 = {
  position: "absolute",
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "800px",
  height: "600px",
  
  bgcolor: 'background.paper',

  display: "flex",
  flexDirection: "column",
  
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
  const camera = useRef(null);
  const [image, setImage] = useState(null);


  
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
   
    <Box width = "100vw" height = "100vh" display = {'flex'} alignItems={'center'}  flexDirection={'column'} gap = {2}   >
    <Typography
  variant="h3"
  sx={{
    background: 'linear-gradient(90deg, #0000FF, #00FFFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    MozBackgroundClip: 'text',
    MozTextFillColor: 'transparent',
  }}
>
   AI Pantry React Web Application
  </Typography>
     <Box
      justifyContent="space-between"
      sx={{
        width: {
          xs: '100%', // 100% width on extra-small screens
          sm: '80%',  // 80% width on small screens
          md: '70%',  // 70% width on medium screens
          lg: '60%',  // 60% width on large screens
          xl: '50%'   // 50% width on extra-large screens
        },
      
      }}
    >
      <TextField
        id="outlined-basic"
        ref={inputRef}
        label="Search Items in Pantry"
        variant="outlined"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        sx={{
          width: '100%',  // take full width of the Box
          minHeight: '10px',
          border: '2px solid #333',
          boxSizing: 'border-box',
          borderRadius: '20px' ,
        }}
      />
    </Box>
      <Button variant="contained" onClick={handleOpen}>Add Items by Typing</Button>
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
  <Button variant="outlined" minheight = "10px"  onClick = {() => { addItem(items)}} >Add</Button>
   </Stack>
  </Box>
</Modal>







<Box 
  sx={{

    border: '2px solid #333',
    boxSizing: 'border-box',
    borderRadius: '10px' ,

    minheight: '100px',
  
    justifyContent: "space-between",
    
    width: {
        xs: '100%', // 100% width on extra-small screens
        sm: '80%',  // 80% width on small screens
        md: '70%',  // 70% width on medium screens
        lg: '60%',  // 60% width on large screens
        xl: '50%'   // 50% width on extra-large screens
      },
       // center the box horizontally
    }}
  >

      
      <Box bgcolor={'f0f0f0'} textAlign={'center'}>
      
      <Typography variant={"h2"} color = {"#333"} textAlign={'center'}  >
        Pantry Items
        </Typography>
      
  
      </Box>
    
      <Stack  height = "200px" spacing = {2} overflow= {'auto'} >
     {filteredItems.map(({name, count}) => (
      
      <Box  sx={{
      width: "100%" ,
      minHeight: "150px" ,
      display: "flex", 
      alignItems: "center" ,
      bgcolor: "lightblue" ,
      justifyContent: "space-between" ,
   
    }}
      key={name}
    >
    <Box sx = {{

display: "flex",
flexDirection: "column",

    }}>
      <Typography variant={"h4"} color = {"#333"}  sx={{ fontWeight: 'bold' }}  >
      {
      name
      } 
     
</Typography>
<Typography variant={"h8"} color = {"#333"} sx={{ fontStyle: 'italic' }}
  >
Quantity: {
      count
      } 
     
</Typography>
</Box>


<Button variant="contained"  sx={{ marginRight: '20px' }}   onClick = {() => DeleteItem(name)}>Delete</Button>
</Box>

     ))}
      </Stack>
      

  
  
  </Box>

  <Button variant="contained" onClick = {onSubmit}>Generate Recipes</Button>

<Box   

      sx={{
        width: {
          xs: '100%', // 100% width on extra-small screens
          sm: '80%',  // 80% width on small screens
          md: '70%',  // 70% width on medium screens
          lg: '60%',  // 60% width on large screens
          xl: '50%'   // 50% width on extra-large screens
        },
      
      }}>
  
      <Stack  height="200px" spacing={2}   direction={"row"} color={green} overflow={"auto"} >
    { recipes.length > 0 && 
        recipes.map((recipe, index) => (
    <Box
      width="100%"
      minHeight="250px"
      display="flex"
      alignItems="center"
      flexGrow={0}
      
      
      key={index}
      
      
    >
         <Card variant="outlined">
        <CardContent>
          
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          {recipe.name}
          </Typography>
          
          <Typography variant="body2">
            {recipe.description}
         
          </Typography>
        </CardContent>
       
      </Card>
     
     
    </Box>
  ))}
</Stack>

    </Box>
  
    </Box>
  );
}
