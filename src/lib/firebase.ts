import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwF5IkoNVJ5_IqzPcwkdgAQctSJOs9Z8A",
  authDomain: "vishal-home-page-55596.firebaseapp.com",
  projectId: "vishal-home-page-55596",
  storageBucket: "vishal-home-page-55596.firebasestorage.app",
  messagingSenderId: "903632524377",
  appId: "1:903632524377:web:335a6093231a9a9f2d8d48",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
