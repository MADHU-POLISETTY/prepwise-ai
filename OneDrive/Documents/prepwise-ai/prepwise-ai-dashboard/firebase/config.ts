// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDORsKb45I_y6W5LNJo5tn60yMQDZ4EzH4",
  authDomain: "prepwise-ai-59cf4.firebaseapp.com",
  projectId: "prepwise-ai-59cf4",
  storageBucket: "prepwise-ai-59cf4.firebasestorage.app",
  messagingSenderId: "735228694896",
  appId: "1:735228694896:web:6dc741f84eeaad55fbbfb5",
  measurementId: "G-Y4XYVRG9RH"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);