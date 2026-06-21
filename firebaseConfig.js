import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsRQFg_gowT88A6pBU3TqDZA35QxsRkns",
  authDomain: "app-cadastro-produtos-c27ba.firebaseapp.com",
  projectId: "app-cadastro-produtos-c27ba",
  storageBucket: "app-cadastro-produtos-c27ba.firebasestorage.app",
  messagingSenderId: "9279017339",
  appId: "1:9279017339:web:bc0ead339a682b0bb3edde"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);