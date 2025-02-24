// src/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/performance';
import 'firebase/compat/functions';

// Firebase configuration using environment variables with fallback defaults.
// Note: Firebase requires these keys to be named exactly as below.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_DEFAULT_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "influencertokenplatform.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "influencertokenplatform",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "influencertokenplatform.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "35415447790",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:35415447790:web:590473b5fa517fd4297bff",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-PQLG5X39YX"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const performance = firebase.performance();
const functions = firebase.functions();

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export { performance, functions };
export default firebase;
