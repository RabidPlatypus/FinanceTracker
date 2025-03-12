const { db, admin } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// 📌 User Signup Handler
const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists in Firestore
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user in Firestore
    await userRef.set({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Error signing up", error });
  }
};

// 📌 Export all functions correctly
module.exports = { signup };


// 📌 Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = doc.data();
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// 📌 Google Login
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const email = decodedToken.email;
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        email,
        firstName: decodedToken.name.split(" ")[0],
        lastName: decodedToken.name.split(" ")[1] || "",
      });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { firstName: decodedToken.name.split(" ")[0], lastName: decodedToken.name.split(" ")[1] || "", email } });
  } catch (error) {
    res.status(500).json({ message: "Error with Google login", error });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

module.exports = { getUserProfile };


module.exports = { signup, login, googleLogin, getUserProfile };
