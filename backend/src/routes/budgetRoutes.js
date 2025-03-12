const express = require("express");
const { setBudget, getBudget, updateBudget, listBudgets } = require("../controllers/budgetController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/set", authenticateUser, setBudget);
router.get("/list", authenticateUser, listBudgets);
router.get("/:monthYear", authenticateUser, getBudget);
router.put("/update/:monthYear", authenticateUser, updateBudget);


module.exports = router;
