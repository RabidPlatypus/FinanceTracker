const express = require("express");
const { addExpense, listExpenses, updateExpense, deleteExpense } = require("../controllers/expenseController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add", authenticateUser, addExpense);
router.get("/list", authenticateUser, listExpenses);
router.put("/update/:id", authenticateUser, updateExpense);
router.delete("/delete/:id", authenticateUser, deleteExpense);

module.exports = router;
