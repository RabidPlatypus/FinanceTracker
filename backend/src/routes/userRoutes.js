const express = require("express");
const { updateUserProfile, changePassword, deleteUserAccount } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.put("/update", authenticateUser, updateUserProfile);
router.put("/change-password", authenticateUser, changePassword);
router.delete("/delete", authenticateUser, deleteUserAccount);

module.exports = router;
