import { useEffect, useState } from "react";
import API from "../api";

function Dashboard() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await API.get("/expenses/list");
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    
    fetchExpenses();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>{expense.description} - ${expense.amount}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
