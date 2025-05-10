import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHfx_CpMxgOfDk-PBNpf7E5lI4un1m58A",
  authDomain: "abesoneview.firebaseapp.com",
  projectId: "abesoneview",
  storageBucket: "abesoneview.firebasestorage.app",
  messagingSenderId: "983284868573",
  appId: "1:983284868573:web:4315f0f38e8e2530d54234"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, auth }; 
