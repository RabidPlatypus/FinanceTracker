import { useEffect, useState } from "react";
import API from "../api";
import "./Dashboard.css";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [totalSpent, setTotalSpent] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", date: getCurrentDate(), description: "" });
  const [updatedBudget, setUpdatedBudget] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]);

  async function fetchDashboardData() {
    try {
      const expenseRes = await API.get(`/expenses/list?start=${selectedMonth}-01&end=${selectedMonth}-31`);
      let budgetData = null;
      let spentAmount = 0;

      try {
        const budgetRes = await API.get(`/budget/${selectedMonth}`);
        budgetData = budgetRes.data;
        setUpdatedBudget(budgetData?.amount || ""); // Set default value for modal
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn("No budget found for this month.");
        }
      }

      spentAmount = expenseRes.data.reduce((acc, expense) => acc + parseFloat(expense.amount), 0); // ✅ Correctly sum total spent

      setExpenses(expenseRes.data);
      setBudget(budgetData);
      setTotalSpent(spentAmount);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }

  function getCurrentMonthYear() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function getCurrentDate() {
    return new Date().toISOString().split("T")[0];
  }

  function getBudgetUsagePercentage() {
    if (!budget || budget.amount === 0) return 0;
    return ((totalSpent / budget.amount) * 100).toFixed(2);
  }

  function getProgressBarColor() {
    const usage = getBudgetUsagePercentage();
    if (usage < 75) return "green";
    if (usage < 90) return "orange";
    return "red";
  }

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.date || !newExpense.description) {
      alert("⚠ Please complete all fields before adding an expense.");
      return;
    }

    try {
      const expenseData = {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        description: newExpense.description,
      };

      await API.post("/expenses/add", expenseData);
      setShowExpenseModal(false);
      setNewExpense({ category: "", amount: "", date: getCurrentDate(), description: "" });
      fetchDashboardData(); // ✅ Refresh budget & expenses
    } catch (error) {
      console.error("Error adding expense:", error.response?.data || error.message);
    }
  };

  const handleUpdateBudget = async () => {
    try {
      await API.put(`/budget/update/${selectedMonth}`, { amount: parseFloat(updatedBudget) });
      setShowBudgetModal(false);
      fetchDashboardData(); // ✅ Refresh budget immediately
    } catch (error) {
      console.error("Error updating budget:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="left-panel">
        <h1>Dashboard</h1>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="month-selector"
        />

        <div className="budget-section">
          <h2>Monthly Budget</h2>
          {budget ? (
            <>
              <p>Budget for {selectedMonth}: <strong>${parseFloat(budget.amount).toFixed(2)}</strong></p>
              <p>Total Spent: <strong>${parseFloat(totalSpent).toFixed(2)}</strong></p>

              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.max(getBudgetUsagePercentage(), 5)}%`, backgroundColor: getProgressBarColor() }}
                ></div>
              </div>

              {getBudgetUsagePercentage() >= 75 && (
                <p className="warning">⚠ Warning: You have used {getBudgetUsagePercentage()}% of your budget!</p>
              )}
            </>
          ) : (
            <p>No budget set for this month.</p>
          )}
        </div>

        <button className="add-expense-button" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
        <button className="update-budget-button" onClick={() => setShowBudgetModal(true)}>Update Budget</button>
      </div>

      {showExpenseModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Expense</h2>
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}>
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Transportation">Transportation</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Housing">Housing</option>
              <option value="Utilities">Utilities</option>
              <option value="Other">Other</option>
            </select>
            <input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
            <input type="text" placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
            <button onClick={handleAddExpense}>Save Expense</button>
            <button className="close-button" onClick={() => setShowExpenseModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showBudgetModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update Budget</h2>
            <input
              type="number"
              placeholder="Enter new budget"
              value={updatedBudget}
              onChange={(e) => setUpdatedBudget(e.target.value)}
            />
            <button onClick={handleUpdateBudget}>Save</button>
            <button className="close-button" onClick={() => setShowBudgetModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
