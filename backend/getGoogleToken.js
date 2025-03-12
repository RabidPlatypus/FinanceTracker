const { initializeApp } = require("firebase/app");
const { getAuth, signInWithCredential, GoogleAuthProvider } = require("firebase/auth");

// 🔥 Replace with your Firebase project config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCdlQyTAQ1LY4GzXLh0KyDeHzHJASm8S58",
    authDomain: "financetracker-x1143-a5d8e.firebaseapp.com",
    projectId: "financetracker-x1143-a5d8e",
    storageBucket: "financetracker-x1143-a5d8e.firebasestorage.app",
    messagingSenderId: "993144753408",
    appId: "1:993144753408:web:0d3903a008828ff0f477e5",
    measurementId: "G-K0NHPNSK95"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Function to manually generate a Google ID Token
async function getGoogleIdToken() {
  try {
    // Open this URL manually in your browser & sign in:  
    console.log("Go to this URL and sign in to get an ID Token:");
    console.log("https://accounts.google.com/o/oauth2/auth?response_type=token&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost&scope=email profile");

    // Manually paste the ID token here after signing in
    const googleIdToken = "PASTE_YOUR_ID_TOKEN_HERE";  // Replace with the token you get

    // Authenticate with Firebase using the token
    const credential = GoogleAuthProvider.credential(googleIdToken);
    const userCredential = await signInWithCredential(auth, credential);
    
    console.log("Google ID Token:", googleIdToken);
  } catch (error) {
    console.error("Error getting Google ID Token:", error.message);
  }
}

getGoogleIdToken();
