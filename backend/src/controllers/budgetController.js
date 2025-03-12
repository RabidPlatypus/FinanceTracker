const { db } = require("../config/firebase");

// 📌 Set Budget
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

// 📌 Get Budget
const getBudget = async (req, res) => {
  try {
    const { monthYear } = req.params;
    const userEmail = req.user.email;

    const budgetRef = db.collection("users").doc(userEmail).collection("budgets").doc(monthYear);
    const doc = await budgetRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "No budget found for this month." });
    }

    res.json(doc.data());
  } catch (error) {
    console.error("Get Budget Error:", error);
    res.status(500).json({ message: "Error fetching budget", error });
  }
};

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
  
  module.exports = { setBudget, getBudget, updateBudget, listBudgets, deleteBudget, budgetUsage };  // ✅ Ensure all functions are exported
  
  
