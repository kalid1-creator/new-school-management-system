import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Hardcoded configuration to ensure reliability across hosting platforms
const firebaseConfig = {
    apiKey: "AIzaSyCycMupVBpkDDegGsc7h56P25B4oArWPR4",
    authDomain: "school-management-977e9.firebaseapp.com",
    projectId: "school-management-977e9",
    storageBucket: "school-management-977e9.firebasestorage.app",
    messagingSenderId: "543603942722",
    appId: "1:543603942722:web:16b9e6f282f083b08c94db"
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

let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error("❌ Firebase failed to initialize:", error);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
