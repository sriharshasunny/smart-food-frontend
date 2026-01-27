// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUd6jSVC-Xr_1qqFMDWIW5M_CkaPJ3ZYk",
    authDomain: "harshaotp-9e413.firebaseapp.com",
    projectId: "harshaotp-9e413",
    storageBucket: "harshaotp-9e413.firebasestorage.app",
    messagingSenderId: "1019440030158",
    appId: "1:1019440030158:web:2bf55deb81e1a89a370b9f",
    measurementId: "G-77FGEFTZFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app); // Exporting auth for Login.jsx
export default app;
