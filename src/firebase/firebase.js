import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrCkH80dUtiKm_D-01VI5ZUkJ9KhG8J18",
  authDomain: "auto-seat.firebaseapp.com",
  projectId: "auto-seat",
  storageBucket: "auto-seat.firebasestorage.app",
  messagingSenderId: "894669376476",
  appId: "1:894669376476:web:8aa70aaf6b68336858dd19",
  measurementId: "G-BXK39763S2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
