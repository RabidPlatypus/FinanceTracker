const express = require("express");
const { signup, login, getUserProfile } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);  
router.post("/login", login);
router.get("/profile", authenticateUser, getUserProfile);
router.get("/test", (req, res) => res.send("Auth routes are working!"));


module.exports = router;
