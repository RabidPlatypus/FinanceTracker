const { db, admin } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Signup - Create a new user
const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Make sure all fields are provided
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();
  
    if (doc.exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
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

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login request received for:", email); // Debugging
    
    // Look for user in Firestore based on provided email
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      console.log("User not found in database"); // Debugging
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = doc.data();
    console.log("User found:", user); // Debugging

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password"); // Debugging
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });

    console.log("Login successful!"); // Debugging
    res.json({ token, user: { firstName: user.firstName, lastName: user.lastName, email } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get User Profile
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

module.exports = { signup, login, googleLogin, getUserProfile };
