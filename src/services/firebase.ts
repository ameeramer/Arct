// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaZqaakPBvERsl8nGkpMePqIAcNzobfVM",
  authDomain: "arct-7af54.firebaseapp.com",
  projectId: "arct-7af54",
  storageBucket: "arct-7af54.appspot.com",
  messagingSenderId: "711431306219",
  appId: "1:711431306219:web:00cd1065e672a4a227f7ae",
  measurementId: "G-28GXSP44RF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// For local development, configure storage to use CORS headers
// This will be ignored in production environments
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Log that we're using a development environment
  console.log('Running in development mode - applying additional Firebase config');
  
  // Set storage custom settings for local development
  // Note: For actual CORS settings, you need to set them on the Firebase console/backend
  storage.maxOperationRetryTime = 30000; // Increase retry time for better reliability
}
