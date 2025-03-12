const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");

// 📌 Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userEmail = req.user.email;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const userRef = db.collection("users").doc(userEmail);
    await userRef.update({ firstName, lastName, email });

    res.json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// 📌 Change Password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userEmail = req.user.email;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required." });
    }

    const userRef = db.collection("users").doc(userEmail);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userDoc.data();
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRef.update({ password: hashedPassword });

    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Error changing password", error });
  }
};

// 📌 Delete User Account
const deleteUserAccount = async (req, res) => {
  try {
    const userEmail = req.user.email;

    // 🔥 Delete user data from Firestore
    await db.collection("users").doc(userEmail).delete();

    res.json({ message: "Account deleted successfully!" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({ message: "Error deleting account", error });
  }
};

module.exports = { updateUserProfile, changePassword, deleteUserAccount };
