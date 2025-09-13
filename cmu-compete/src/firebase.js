// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCPMDovkepEAZG8x9KI7ToA8KPpx8bVvRw",
    authDomain: "cmu-compete.firebaseapp.com",
    projectId: "cmu-compete",
    storageBucket: "cmu-compete.firebasestorage.app",
    messagingSenderId: "997370663174",
    appId: "1:997370663174:web:637caba90f47f325d98e87",
    measurementId: "G-778ECCFJQS"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

