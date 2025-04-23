const { db } = require("../config/firebase");

// Set budget for a specific month/year
const setBudget = async (req, res) => {
  try {
    const { monthYear, amount } = req.body;
    const userEmail = req.user.email;

    if (!monthYear || !amount) {
      return res.status(400).json({ message: "Month/Year and Amount are required." });
    }

    const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(monthYear);
    await budgetRef.set({ amount });

    res.json({ message: `Budget set for ${monthYear}` });
  } catch (error) {
    console.error("Set Budget Error:", error);
    res.status(500).json({ message: "Error setting budget", error });
  }
};

// Get budget for a specific month/year
const getBudget = async (req, res) => {
  try {
    const { monthYear } = req.params;
    const userEmail = req.user.email;

    const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(monthYear);
    const doc = await budgetRef.get();

    if (!doc.exists) {
      return res.json({ amount: 0 }); 
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Get Budget Error:", error);
    res.status(500).json({ message: "Error fetching budget", error });
  }
};

// Update an existing budget
const updateBudget = async (req, res) => {
    try {
      const { monthYear } = req.params;
      const { amount } = req.body;
      const userEmail = req.user.email;
  
      if (!amount) {
        return res.status(400).json({ message: "New budget amount is required." });
      }
  
      const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(monthYear);
      const doc = await budgetRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: "Budget for this month does not exist." });
      }
  
      await budgetRef.update({ amount });
  
      res.json({ message: `Budget for ${monthYear} updated successfully!` });
    } catch (error) {
      console.error("Update Budget Error:", error);
      res.status(500).json({ message: "Error updating budget", error });
    }
  };
  
  // Get a list of all budgets for the current user
  const listBudgets = async (req, res) => {
    try {
      const userEmail = req.user.email;
  
      const budgetsSnapshot = await db.collection("users").doc(userEmail).collection("budgets").get();
  
      const budgets = budgetsSnapshot.docs.map(doc => ({
        monthYear: doc.id,
        amount: doc.data().amount
      }));
  
      res.json(budgets);
    } catch (error) {
      console.error("List Budgets Error:", error);
      res.status(500).json({ message: "Error fetching budgets", error });
    }
  };  
  
  // Delete budget for a specific month/year
  const deleteBudget = async (req, res) => {
    try {
      const { monthYear } = req.params;
      const userEmail = req.user.email;
  
      const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(monthYear);
      const doc = await budgetRef.get();
  
      if (!doc.exists) {
        return res.status(404).json({ message: "Budget for this month does not exist." });
      }
  
      await budgetRef.delete();
      res.json({ message: `Budget for ${monthYear} deleted successfully!` });
    } catch (error) {
      console.error("Delete Budget Error:", error);
      res.status(500).json({ message: "Error deleting budget", error });
    }
  };

  // Calculate budget usage for a specific month/year
  const budgetUsage = async (req, res) => {
    try {
      const { monthYear } = req.params;
      const userEmail = req.user.email;
  
      const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(monthYear);
      const budgetDoc = await budgetRef.get();
  
      if (!budgetDoc.exists) {
        return res.status(404).json({ message: "No budget set for this month." });
      }
  
      const budgetAmount = budgetDoc.data().amount;
  
      const expensesSnapshot = await db.collection("users").doc(userEmail)
        .collection("expenses")
        .where("date", ">=", `${monthYear}-01`)
        .where("date", "<=", `${monthYear}-31`)
        .get();
  
      const totalSpent = expensesSnapshot.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
      const percentageUsed = ((totalSpent / budgetAmount) * 100).toFixed(2);
  
      res.json({ budgetAmount, totalSpent, percentageUsed });
    } catch (error) {
      console.error("Budget Usage Error:", error);
      res.status(500).json({ message: "Error calculating budget usage", error });
    }
  };

  // Get budget usage history for the current user
  const getBudgetUsageHistory = async (req, res) => {
    try {
      const userEmail = req.user.email;
  
      const budgetsSnapshot = await db.collection("users").doc(userEmail).collection("budgets").orderBy("monthYear", "asc").get();
      const budgets = budgetsSnapshot.docs.map(doc => ({
        monthYear: doc.id,
        budgetAmount: doc.data().amount
      }));
  
      const expensesSnapshot = await db.collection("users").doc(userEmail).collection("expenses").get();
      const expenses = expensesSnapshot.docs.map(doc => doc.data());
  
      const expenseByMonth = {};
      expenses.forEach(exp => {
        const monthYear = exp.date.substring(0, 7);
        if (!expenseByMonth[monthYear]) expenseByMonth[monthYear] = 0;
        expenseByMonth[monthYear] += exp.amount;
      });
  
      const history = budgets.map(budget => ({
        monthYear: budget.monthYear,
        budgetAmount: budget.budgetAmount,
        totalSpent: expenseByMonth[budget.monthYear] || 0,
        percentageUsed: budget.budgetAmount > 0
          ? ((expenseByMonth[budget.monthYear] || 0) / budget.budgetAmount * 100).toFixed(2)
          : "0.00"
      }));
  
      console.log("Budget API Response:", history); // Debugging
  
      res.json(history);
    } catch (error) {
      console.error("Budget Usage History Error:", error);
      res.status(500).json({ message: "Error fetching budget usage history", error });
    }
  };
  
  
  module.exports = { setBudget, getBudget, updateBudget, listBudgets, deleteBudget, budgetUsage, getBudgetUsageHistory };  
  
  
