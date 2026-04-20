import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCuMOEw0R1OVkvOS0iGBNTWxJxMjlS6B9w",
  authDomain: "beverageshop-1970.firebaseapp.com",
  projectId: "beverageshop-1970",
  storageBucket: "beverageshop-1970.firebasestorage.app",
  messagingSenderId: "749114148434",
  appId: "1:749114148434:web:a086c037f418662069c18b",
  measurementId: "G-M9M0Y01ZF8",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default db;
