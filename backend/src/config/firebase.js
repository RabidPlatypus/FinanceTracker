const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Load Firebase service account key
const serviceAccount = require("./firebaseServiceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
