import { useEffect, useState } from "react";
import API from "../api";
import "./Dashboard.css";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [totalSpent, setTotalSpent] = useState(0);

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
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn("No budget found for this month.");
        } else {
          throw error;
        }
      }

      try {
        const usageRes = await API.get(`/budget/usage/${selectedMonth}`);
        spentAmount = usageRes.data.totalSpent;
      } catch (error) {
        console.warn("No spending data found for this month.");
      }

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

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="budget-section">
        <h2>Monthly Budget</h2>
        {budget ? (
          <>
            <p>Budget for {selectedMonth}: <strong>${budget.amount}</strong></p>
            <p>Total Spent: <strong>${totalSpent}</strong></p>
            
            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${getBudgetUsagePercentage()}%`, backgroundColor: getProgressBarColor() }}
              ></div>
            </div>
            
            {/* Budget Warnings */}
            {getBudgetUsagePercentage() >= 75 && (
              <p className="warning">⚠ Warning: You have used {getBudgetUsagePercentage()}% of your budget!</p>
            )}
          </>
        ) : (
          <p>No budget set for this month.</p>
        )}
      </div>

      <div className="expenses-section">
        <h2>Recent Expenses</h2>
        {expenses.length > 0 ? (
          <ul>
            {expenses.slice(0, 5).map((expense) => (
              <li key={expense.id}>
                {expense.date} - {expense.category}: ${expense.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>No expenses recorded.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
