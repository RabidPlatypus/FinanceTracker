const express = require("express");
const { addExpense, listExpenses, updateExpense, deleteExpense, addRecurringExpense, getExpenseReport } = require("../controllers/expenseController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/add", authenticateUser, addExpense);
router.get("/list", authenticateUser, listExpenses);
router.put("/update/:id", authenticateUser, updateExpense);
router.delete("/delete/:id", authenticateUser, deleteExpense);
router.post("/recurring", authenticateUser, addRecurringExpense);
router.get("/report/:monthYear", authenticateUser, getExpenseReport);

module.exports = router;
