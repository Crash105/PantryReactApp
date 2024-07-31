// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHlTYVCwx3F5dqGWxVpnPJU2yjBUiYd8U",
  authDomain: "pantryapp-1d274.firebaseapp.com",
  projectId: "pantryapp-1d274",
  storageBucket: "pantryapp-1d274.appspot.com",
  messagingSenderId: "672038107791",
  appId: "1:672038107791:web:8dd5cb4776baa6153b4efa",
  measurementId: "G-PRVMQEYCEQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



const firestore = getFirestore(app)
export {app, firestore}

