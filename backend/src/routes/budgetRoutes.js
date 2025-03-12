const express = require("express");
const { setBudget, getBudget, updateBudget, listBudgets, deleteBudget, budgetUsage  } = require("../controllers/budgetController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/set", authenticateUser, setBudget);
router.get("/list", authenticateUser, listBudgets);
router.get("/:monthYear", authenticateUser, getBudget);
router.put("/update/:monthYear", authenticateUser, updateBudget);
router.delete("/delete/:monthYear", authenticateUser, deleteBudget);
router.get("/usage/:monthYear", authenticateUser, budgetUsage);

module.exports = router;
