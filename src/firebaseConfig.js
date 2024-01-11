// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA7C-s2axLwc4raYRik-6h92srvGSKFXq4",
    authDomain: "client-61820.firebaseapp.com",
    projectId: "client-61820",
    storageBucket: "client-61820.appspot.com",
    messagingSenderId: "241579686208",
    appId: "1:241579686208:web:3a7df9567f8c71fb0fe2a5",
    measurementId: "G-6YM4G13GMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
// const analytics = getAnalytics(app);
export default messaging? messaging:null;