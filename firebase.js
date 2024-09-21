// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "pantryapp1-31de4.firebaseapp.com",
  projectId: "pantryapp1-31de4",
  storageBucket: "pantryapp1-31de4.appspot.com",
  messagingSenderId: "898496120948",
  appId: "1:898496120948:web:9529ce9a2a34f9623a2921",
  measurementId: "G-2TB8DR557J",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);
export { app, firestore };
