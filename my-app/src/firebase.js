// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { GoogleAuthProvider } from 'firebase/auth';

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPwp5H8WWj_ZcDNGxicKH5fI5Ae7U33k0",
  authDomain: "finance-web-app-9619d.firebaseapp.com",
  projectId: "finance-web-app-9619d",
  storageBucket: "finance-web-app-9619d.appspot.com", // corrected URL here
  messagingSenderId: "284303807275",
  appId: "1:284303807275:web:5f0c207bf013461bafab6e",
  measurementId: "G-6JYJ56DYLC"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Export the Firebase app instance (optional, if you need it elsewhere)
export default app;
