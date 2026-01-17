import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Environment variables are the best practice for Firebase keys
// You can set these in Netlify settings or a .env file locally
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Diagnostic logging for the user (only in dev or if keys missing)
const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value === "YOUR_API_KEY")
    .map(([key]) => key);

if (missingKeys.length > 0) {
    console.warn("⚠️ Firebase Configuration Incomplete! Missing keys:", missingKeys.join(", "));
} else {
    const maskedKey = firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...${firebaseConfig.apiKey.slice(-3)}` : 'MISSING';
    console.log(`✅ Firebase initialized with API Key: ${maskedKey}`);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
