
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4HfyW8SgvkxnkTaGTYRlGqiu1IFCIXiQ",
  authDomain: "questmaster-6509b.firebaseapp.com",
  projectId: "questmaster-6509b",
  storageBucket: "questmaster-6509b.appspot.com",
  messagingSenderId: "726953620290",
  appId: "1:726953620290:web:6709aa4800369d257a0edb",
  measurementId: "G-WELQFNMJCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// Register function
const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login function
const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign out function
const signOutUser = () => {
  return signOut(auth);
};

// Auth state observer
const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Export the authentication functions
export {
  auth,
  registerUser,
  loginUser,
  signOutUser,
  onAuthStateChangedListener
};