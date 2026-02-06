// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <--- We added this line
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDziawHiap3K4c2LxobeBVijV7YUpCtQn0",
  authDomain: "organizer-a24ee.firebaseapp.com",
  projectId: "organizer-a24ee",
  storageBucket: "organizer-a24ee.firebasestorage.app",
  messagingSenderId: "88018112802",
  appId: "1:88018112802:web:ba60a5fceedb269211957b",
  measurementId: "G-4KJ9PR8E0Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the Database so other files can use it
export const db = getFirestore(app);  // <--- And this line
export const auth = getAuth(app);