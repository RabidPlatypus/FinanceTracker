import { useEffect, useState } from "react";
import API from "../api";
import "./Dashboard.css";
import { CSVLink } from "react-csv";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [totalSpent, setTotalSpent] = useState(0);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingExpense, setEditingExpense] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", date: getCurrentDate(), description: "" });
  const [updatedBudget, setUpdatedBudget] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, fetchDashboardData]); 
  
  

  async function fetchDashboardData() {
    try {
      const expenseRes = await API.get(`/expenses/list`);
      const budgetRes = await API.get(`/budget/${selectedMonth}`).catch(() => null);

      const spentAmount = expenseRes.data
      .filter(expense => new Date(expense.date).toISOString().slice(0, 7) === selectedMonth)
      .reduce((acc, expense) => acc + parseFloat(expense.amount || 0), 0);



      setExpenses(expenseRes.data);
      setBudget(budgetRes?.data || null);
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
    if (!budget || budget.amount === 0) return totalSpent > 0 ? 100 : 0; // ✅ Show 100% if no budget but expenses exist
    return ((totalSpent / budget.amount) * 100).toFixed(2);
  }  

  function getProgressBarColor() {
    const usage = getBudgetUsagePercentage();
    if (budget?.amount === 0 && totalSpent > 0) return "red"; // ✅ Force red if over budget with no budget
    if (usage < 75) return "green";
    if (usage < 90) return "orange";
    return "red";
  }  

  function handleDeleteExpense(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    API.delete(`/expenses/delete/${id}`).then(fetchDashboardData).catch(console.error);
  }

  function handleSortChange(event) {
    setSortOrder(event.target.value);
  }

  function filteredAndSortedExpenses() {
    return expenses
      .filter(expense => 
        (!filterCategory || expense.category === filterCategory) &&
        (!filterStartDate || new Date(expense.date) >= new Date(filterStartDate)) &&
        (!filterEndDate || new Date(expense.date) <= new Date(filterEndDate))
      )
      .sort((a, b) => sortOrder === "asc" ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
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
    if (!updatedBudget || isNaN(updatedBudget) || parseFloat(updatedBudget) <= 0) {
      alert("⚠ Please enter a valid budget amount.");
      return;
    }
  
    try {
      console.log(`🔍 Checking if budget exists for: ${selectedMonth}`);
      
      let budgetCheck;
      try {
        let budgetCheck;
        try {
          budgetCheck = await API.get(`/budget/${selectedMonth}`);
          
          // ✅ If the budget exists but is `0`, we still need to check if it's actually stored in Firestore
          if (budgetCheck.data?.amount === 0) {
            console.warn("⚠ Budget returned 0, checking if it actually exists...");
            
            // Try updating it and see if it fails
            const testUpdate = await API.put(`/budget/update/${selectedMonth}`, { amount: 0 }).catch(() => null);
            
            if (!testUpdate) {
              console.warn("❌ No actual budget entry found, treating as new.");
              budgetCheck = null;
            }
          }
          
          console.log("✅ Budget found:", budgetCheck?.data);
        } catch (error) {
          if (error.response?.status === 404) {
            console.warn("⚠ No budget found for this month.");
          } else {
            console.error("❌ Error fetching budget:", error);
          }
          budgetCheck = null;
        }

      } catch (error) {
        if (error.response?.status === 404) {
          console.warn("⚠ No budget found for this month.");
        } else {
          console.error("❌ Error fetching budget:", error);
        }
        budgetCheck = null;
      }
  
      let response;
      if (budgetCheck?.data) {
        console.log(`🔄 Updating existing budget for ${selectedMonth} to $${updatedBudget}`);
        response = await API.put(`/budget/update/${selectedMonth}`, { amount: parseFloat(updatedBudget) });
      } else {
        console.log(`🆕 Creating new budget for ${selectedMonth} with amount: $${updatedBudget}`);
        const requestData = { month: selectedMonth, amount: parseFloat(updatedBudget) };
        console.log("📤 Sending data to backend:", requestData);

        response = await API.post(`/budget/set`, requestData, { headers: { "Content-Type": "application/json" } });

      }
  
      if (response.status === 200 || response.status === 201) {
        console.log("✅ Budget updated successfully:", response.data);
        setBudget({ amount: parseFloat(updatedBudget) });
        setShowBudgetModal(false);
        fetchDashboardData();
      } else {
        console.error("❌ Unexpected response status:", response.status);
        alert("Error updating budget. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error updating budget:", error);
      alert("Failed to update budget. Please try again.");
    }
  };  

  const handleSaveExpense = async () => {
    try {
      await API.put(`/expenses/update/${editingExpense.id}`, editingExpense);
      setEditingExpense(null); // Close modal
      fetchDashboardData(); // Refresh the expense list
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };
  

  return (
    <div className="dashboard-container">
      {/* Left Panel: Budget Section */}
      <div className="left-panel">
        <h1>Dashboard</h1>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="month-selector" />
        <div className="budget-section">
          <h2>Monthly Budget</h2>
          {budget ? (
            <>
              <p>Budget for {selectedMonth}: <strong>${parseFloat(budget.amount).toFixed(2)}</strong></p>
              <p>Total Spent: <strong>${parseFloat(totalSpent).toFixed(2)}</strong></p>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${Math.max(getBudgetUsagePercentage(), 5)}%`, backgroundColor: getProgressBarColor() }}></div>
              </div>
            </>
          ) : <p>No budget set for this month.</p>}
        </div>
        <button className="add-expense-button" onClick={() => setShowExpenseModal(true)}>+ Add Expense</button>
        <button className="update-budget-button" onClick={() => setShowBudgetModal(true)}>Update Budget</button>
      </div>

      {/* Right Panel: Expense List */}
      <div className="right-panel">
        <h2>Expense List</h2>
        <div className="expense-filters">
          <select onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
            <option value="Housing">Housing</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
          <input type="date" onChange={(e) => setFilterStartDate(e.target.value)} />
          <input type="date" onChange={(e) => setFilterEndDate(e.target.value)} />
          <select onChange={handleSortChange}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          <CSVLink data={filteredAndSortedExpenses()} filename="expenses.csv" className="export-button">Export CSV</CSVLink>
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

    {editingExpense && (
      <div className="modal">
        <div className="modal-content">
          <h2>Edit Expense</h2>

          {/* Edit Fields */}
          <label>Category:</label>
          <select value={editingExpense.category} onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Health">Health</option>
            <option value="Housing">Housing</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>

          <label>Amount:</label>
          <input type="number" value={editingExpense.amount} onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })} />

          <label>Date:</label>
          <input type="date" value={editingExpense.date} onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })} />

          <label>Description:</label>
          <input type="text" value={editingExpense.description} onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })} />

          {/* Save & Cancel Buttons */}
          <button onClick={handleSaveExpense}>Save</button>
          <button className="close-button" onClick={() => setEditingExpense(null)}>Cancel</button>
        </div>
      </div>
    )}


        <table className="expense-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedExpenses().map(expense => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td>{expense.category}</td>
                <td>{expense.description}</td>
                <td>${parseFloat(expense.amount || 0).toFixed(2)}</td>
                <td>
                  <button className="edit-button" onClick={() => setEditingExpense(expense)}>✏️</button>
                  <button className="delete-button" onClick={() => handleDeleteExpense(expense.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
