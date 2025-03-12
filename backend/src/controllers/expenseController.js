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

const addRecurringExpense = async (req, res) => {
  try {
    const { amount, category, description, startDate, repeatInterval } = req.body;
    const userEmail = req.user.email;

    if (!amount || !category || !startDate || !repeatInterval) {
      return res.status(400).json({ message: "Amount, category, startDate, and repeatInterval are required." });
    }

    const expenseRef = db.collection("users").doc(userEmail).collection("recurring_expenses").doc();

    await expenseRef.set({
      id: expenseRef.id,
      amount,
      category,
      description: description || "",
      startDate,
      repeatInterval, // e.g., "monthly", "weekly"
      nextDueDate: startDate // Auto-generate the next expense from here
    });

    res.status(201).json({ message: "Recurring expense added successfully!" });
  } catch (error) {
    console.error("Add Recurring Expense Error:", error);
    res.status(500).json({ message: "Error adding recurring expense", error });
  }
};

const getExpenseReport = async (req, res) => {
  try {
    const { monthYear } = req.params; // Format: "2025-03"
    const userEmail = req.user.email;

    const expensesSnapshot = await db.collection("users").doc(userEmail)
      .collection("expenses")
      .where("date", ">=", `${monthYear}-01`)
      .where("date", "<=", `${monthYear}-31`)
      .get();

    const expenses = expensesSnapshot.docs.map(doc => doc.data());

    // ✅ Calculate total spending
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // ✅ Group expenses by category
    const categoryBreakdown = {};
    expenses.forEach(exp => {
      if (!categoryBreakdown[exp.category]) {
        categoryBreakdown[exp.category] = 0;
      }
      categoryBreakdown[exp.category] += exp.amount;
    });

    // ✅ Identify top spending category
    const topCategory = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])[0] || ["None", 0];

    res.json({
      monthYear,
      totalSpent,
      categoryBreakdown,
      topSpendingCategory: { category: topCategory[0], amount: topCategory[1] }
    });
  } catch (error) {
    console.error("Expense Report Error:", error);
    res.status(500).json({ message: "Error generating expense report", error });
  }
};

const getExpenseTrends = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const expensesSnapshot = await db.collection("users").doc(userEmail).collection("expenses").get();
    const expenses = expensesSnapshot.docs.map(doc => doc.data());

    // Calculate total spent per month
    const expenseByMonth = {};
    expenses.forEach(exp => {
      const monthYear = exp.date.substring(0, 7); // Extract "YYYY-MM"
      if (!expenseByMonth[monthYear]) {
        expenseByMonth[monthYear] = 0;
      }
      expenseByMonth[monthYear] += exp.amount;
    });

    // Find highest & lowest spending months
    const sortedMonths = Object.entries(expenseByMonth).sort((a, b) => b[1] - a[1]);

    res.json({
      highestSpendingMonth: { monthYear: sortedMonths[0][0], amount: sortedMonths[0][1] },
      lowestSpendingMonth: { monthYear: sortedMonths[sortedMonths.length - 1][0], amount: sortedMonths[sortedMonths.length - 1][1] }
    });
  } catch (error) {
    console.error("Expense Trends Error:", error);
    res.status(500).json({ message: "Error fetching expense trends", error });
  }
};

module.exports = { addExpense, listExpenses, updateExpense, deleteExpense, addRecurringExpense, getExpenseReport, getExpenseTrends };


