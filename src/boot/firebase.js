// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBu4qXYH3i3FWNMFzA3NuWoIp-Y1YtwZ4s",
  authDomain: "ringcrm-be057.firebaseapp.com",
  projectId: "ringcrm-be057",
  storageBucket: "ringcrm-be057.firebasestorage.app",
  messagingSenderId: "409420505636",
  appId: "1:409420505636:web:a3fce6630ccc7d95ab6eb1",
  measurementId: "G-7YFHQM4KV0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);