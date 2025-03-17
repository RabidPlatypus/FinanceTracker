const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();
const firebaseConfig = JSON.parse(process.env.FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
});

const db = admin.firestore();

module.exports = { admin, db };
