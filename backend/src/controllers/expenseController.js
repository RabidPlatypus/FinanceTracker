const { db } = require("../config/firebase");

// 📌 Add Expense
const addExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const userEmail = req.user.email;

    if (!amount || !category || !date) {
      return res.status(400).json({ message: "Amount, category, and date are required." });
    }

    const expenseRef = db.collection("users").doc(userEmail).collection("expenses").doc();
    await expenseRef.set({
      id: expenseRef.id,
      amount,
      category,
      description: description || "",
      date,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: "Expense added successfully!" });
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Error adding expense", error });
  }
};

// 📌 List Expenses
const listExpenses = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { category, start, end } = req.query;  // ✅ Get query params

    let query = db.collection("users").doc(userEmail).collection("expenses");

    if (category) {
      query = query.where("category", "==", category);
    }
    if (start && end) {
      query = query.where("date", ">=", start).where("date", "<=", end);
    }

    const expensesSnapshot = await query.orderBy("date", "desc").get();
    const expenses = expensesSnapshot.docs.map(doc => doc.data());

    res.json(expenses);
  } catch (error) {
    console.error("List Expenses Error:", error);
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

// 📌 Update Expense
const updateExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const userEmail = req.user.email;
    const expenseId = req.params.id;

    const expenseRef = db.collection("users").doc(userEmail).collection("expenses").doc(expenseId);
    const doc = await expenseRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expenseRef.update({ amount, category, description, date });

    res.json({ message: "Expense updated successfully!" });
  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(500).json({ message: "Error updating expense", error });
  }
};

// 📌 Delete Expense
const deleteExpense = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const expenseId = req.params.id;

    const expenseRef = db.collection("users").doc(userEmail).collection("expenses").doc(expenseId);
    await expenseRef.delete();

    res.json({ message: "Expense deleted successfully!" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: "Error deleting expense", error });
  }
};

module.exports = { addExpense, listExpenses, updateExpense, deleteExpense };
