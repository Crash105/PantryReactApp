"use client";
import { Box, Typography, Button } from "@mui/material";
import Stack from "@mui/material/Stack";
import { firestore, auth } from "@/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useAuthState } from "react-firebase-hooks/auth";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Login from "../components/Login";
import { signOut } from "firebase/auth";



const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};


export default function Home() {


  function handleInputChange(event) {
    setItems(event.target.value);
  }

  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setItems(""); };
  const [items, setItems] = useState("");
  const [pantry, setPantry] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipeError, setRecipeError] = useState(null);
  const [user, userLoading, error] = useAuthState(auth);
  const [recipesloading, setRecipesLoading] = useState(false)
  const [pantryError, setPantryError] = useState(null)
  const [pantryLoading, setPantryLoading] = useState(false)

  const onSubmit = async () => {


    try {
      setRecipesLoading(true);
      setRecipeError(null);
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pantryItems: pantry }),
      });
      if (!res.ok) throw new Error(`Recipe generation failed (${res.status})`);
      const data = await res.json();
      setRecipes(data.result);
    } catch (err) {
      setRecipeError(err.message);
    } finally {
      setRecipesLoading(false);
    }

  };

  const pantryCollection = () => collection(firestore, "users", user.uid, "pantry");

  const filteredItems = pantry.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updatePantry = useCallback(async () => {
    setPantryLoading(true);
    const snapshot = collection(firestore, "users", user.uid, "pantry");
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });
    setPantry(pantryList);
    setPantryLoading(false);
  }, [user]);

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setPantryError(err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updatePantry().catch((err) => setPantryError(err.message));
  }, [user, updatePantry]);

  const addItem = async (item) => {
    if (!item.trim()) return;
    setPantryError(null);
    try {
      const normalized = item.trim().toLowerCase();
      const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
      const docRef = doc(pantryCollection(), capitalized);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, { count: count + 1 });
      } else {
        await setDoc(docRef, { count: 1 });
      }
      setItems("");
      await updatePantry();
    } catch (err) {
      setPantryError(err.message);
    }
  };

  const deleteItem = async (item) => {
    setPantryError(null);
    try {
      const docRef = doc(pantryCollection(), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        if (count === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { count: count - 1 });
        }
        await updatePantry();
      }
    } catch (err) {
      setPantryError(err.message);
    }
  };

  if (userLoading) return <h1>Loading</h1>;
  if (error) return <h1>Something went wrong. Please refresh the page.</h1>;
  if (!user) return <Login />;
 

  return (
    <div>
    
    
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      alignItems={"center"}
      flexDirection={"column"}
      gap={2}
    >
    
      <Typography
        variant="h3"
        sx={{
          background: "linear-gradient(90deg, #0000FF, #00FFFF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          MozBackgroundClip: "text",
          MozTextFillColor: "transparent",
        }}
      >
        
        Mealwise
      </Typography>
     
      <Typography variant="h5">Welcome, {user.displayName}</Typography>

      {pantryLoading && (
        <Typography variant="h6">Loading pantry...</Typography>
      )}
      {!pantryLoading && pantry.length === 0 && (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h6">Your pantry is empty — add your first item</Typography>
          <Button variant="contained" onClick={handleOpen}>Add Item</Button>
        </Box>
      )}

      <Box
        justifyContent="space-between"
        sx={{
          width: {
            xs: "100%",
            sm: "80%",
            md: "70%",
            lg: "60%",
            xl: "50%",
          },
        }}
      >
        <TextField
          id="outlined-basic"
          label="Search Items in Pantry"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "20px",
              "& fieldset": {
                border: "2px solid #333",
              },
            },
          }}
        />
      </Box>
      {pantry.length > 0 && (
        <Button variant="contained" onClick={handleOpen}>
          Add Items by Typing
        </Button>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography variant={"h6"} color={"#333"}>
            Add Items
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Add"
              variant="outlined"
              minheight="10px"
              value={items}
              onChange={handleInputChange}
              inputRef={inputRef}
            />
            <Button
              variant="outlined"
              minheight="10px"
              onClick={() => {
                addItem(items);
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>



      <Box
        sx={{
          border: "2px solid #333",
          boxSizing: "border-box",
          borderRadius: "10px",

          minheight: "100px",

          justifyContent: "space-between",

          width: {
            xs: "100%", // 100% width on extra-small screens
            sm: "80%", // 80% width on small screens
            md: "70%", // 70% width on medium screens
            lg: "60%", // 60% width on large screens
            xl: "50%", // 50% width on extra-large screens
          },
          // center the box horizontally
        }}
      >
        <Box bgcolor={"f0f0f0"} textAlign={"center"}>
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
            Pantry Items
          </Typography>
        </Box>

        <Stack height="200px" spacing={2} overflow={"auto"}>
          {filteredItems.map(({ name, count }) => (
            <Box
              sx={{
                width: "100%",
                minHeight: "150px",
                display: "flex",
                alignItems: "center",
                bgcolor: "lightblue",
                justifyContent: "space-between",
              }}
              key={name}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant={"h4"}
                  color={"#333"}
                  sx={{ fontWeight: "bold" }}
                >
                  {name}
                </Typography>
                <Typography
                  variant={"h8"}
                  color={"#333"}
                  sx={{ fontStyle: "italic" }}
                >
                  Quantity: {count}
                </Typography>
              </Box>

               <Button
                variant="contained"
                sx={{ marginRight: "20px" }}
                onClick={() => addItem(name)}
              >
                Add Count
              </Button>

              <Button
                variant="contained"
                sx={{ marginRight: "20px" }}
                onClick={() => deleteItem(name)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button variant="contained" onClick={onSubmit} disabled={recipesloading || pantry.length === 0}>
        {recipesloading ? 'Generating Recipes...' : 'Generate Recipes'}
      </Button>
      <Button variant="contained" onClick={logOut}>
        LogOut
      </Button>
      {recipeError && (
        <Typography color="error" variant="body2">
          {recipeError}
        </Typography>
      )}
      {pantryError && (
        <Typography color="error" variant="body2">
          {pantryError}
        </Typography>
      )}

      <Box
        sx={{
          width: {
            xs: "100%", // 100% width on extra-small screens
            sm: "80%", // 80% width on small screens
            md: "70%", // 70% width on medium screens
            lg: "60%", // 60% width on large screens
            xl: "50%", // 50% width on extra-large screens
          },
        }}
      >
        <Stack
          height="200px"
          spacing={2}
          direction={"row"}
          color="green"
          overflow={"auto"}
        >
          {recipes.length > 0 &&
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
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{ fontWeight: "bold" }}
                    >
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
    </div>
  );
}
