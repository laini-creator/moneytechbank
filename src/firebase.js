// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, remove, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "https://moneytechbank-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // 這裡改成 db

export { db, ref, push, remove, set }; // 這裡也改
