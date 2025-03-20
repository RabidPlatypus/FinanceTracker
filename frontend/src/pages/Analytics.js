import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Select, MenuItem, TextField } from "@mui/material";
import { PieChart, Pie, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import API from "../api";

function Analytics() {
  const [activeTab, setActiveTab] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [highestMonth, setHighestMonth] = useState("");
  const [lowestMonth, setLowestMonth] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4563", "#7D3C98", "#2E86C1"];

  // Fetch expenses from the backend API
  useEffect(() => {
    fetchExpenses();
    if (activeTab === 1) {
      fetchTrendData();
      fetchBudgetUsage();
    }
  }, [categoryFilter, startDate, endDate, activeTab]);  

  async function fetchExpenses() {
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const response = await API.get("/expenses/list", { params });
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }

  // Group expenses by category for Pie Chart
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryData).map((key, index) => ({
    name: key,
    value: categoryData[key],
    color: COLORS[index % COLORS.length],
  }));

  // Group expenses by date for Bar Chart
  const dailyData = expenses.reduce((acc, expense) => {
    const date = expense.date;
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});

  const dailyChartData = Object.keys(dailyData).map((key) => ({
    date: key,
    total: dailyData[key],
  }));

  async function fetchTrendData() {
    try {
      const response = await API.get("/expenses/trends");
      console.log("Fetched Trend Data:", response.data); // Debugging
      if (response.data.length === 0) {
        console.warn("No trend data found.");
      }
      setTrendData(response.data);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  }  
  
  async function fetchBudgetUsage() {
    try {
      const response = await API.get("/budget/usage-history");  
      console.log("Budget Usage Data:", response.data); // Debugging output
      setBudgetData(response.data);
  
      // Identify highest & lowest spending months
      if (response.data.length > 0) {
        const filteredMonths = response.data.filter(month => month.totalSpent > 0); // Ignore months with zero spending
        if (filteredMonths.length > 0) {
          const sortedMonths = [...filteredMonths].sort((a, b) => b.totalSpent - a.totalSpent);
          setHighestMonth(sortedMonths[0].monthYear || "N/A");
          setLowestMonth(sortedMonths[sortedMonths.length - 1].monthYear || "N/A");
        } else {
          setHighestMonth("N/A");
          setLowestMonth("N/A");
        }
      }
      
    } catch (error) {
      console.error("Error fetching budget usage:", error);
    }
  }  

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Analytics 📊
      </Typography>

      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)} 
        variant="fullWidth"
      >

        <Tab label="Spending Overview" />
        <Tab label="Trends Over Time" />
        <Tab label="Comparison Mode" />
      </Tabs>

      {/* Filters Section */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 3 }}>
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} displayEmpty>
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Food">Food</MenuItem>
          <MenuItem value="Transportation">Transportation</MenuItem>
          <MenuItem value="Entertainment">Entertainment</MenuItem>
          <MenuItem value="Shopping">Shopping</MenuItem>
          <MenuItem value="Health">Health</MenuItem>
          <MenuItem value="Housing">Housing</MenuItem>
          <MenuItem value="Utilities">Utilities</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>

        <TextField type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <TextField type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </Box>

      {/* Tab Content */}
      <Box sx={{ marginTop: 3 }}>
        {activeTab === 0 && (
          <>
            <Typography variant="h5" align="center">📊 Spending Overview</Typography>
            
            {/* Pie Chart: Spending Breakdown */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>Spending by Category</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Bar Chart: Spending Per Day */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>Daily Spending</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyChartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {activeTab === 1 && (
          <>
            <Typography variant="h5" align="center">📈 Trends Over Time</Typography>

            {/* Line Chart: Spending Trends */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>Total Spending Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <XAxis dataKey="monthYear" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalSpent" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>

            {/* Bar Chart: Budget vs. Actual Spending */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>Budget vs. Actual Spending</Typography>
            {budgetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <XAxis dataKey="monthYear" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budgetAmount" fill="#0088FE" name="Budget" />
                  <Bar dataKey="totalSpent" fill="#FF4563" name="Actual Spending" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography align="center" sx={{ marginTop: 2 }}>No budget data available.</Typography>
            )}

            {/* Spending Highlights */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>
              🔼 Highest Spending Month: <strong>{highestMonth || "N/A"}</strong>
            </Typography>
            <Typography variant="h6" align="center" sx={{ marginTop: 1 }}>
              🔽 Lowest Spending Month: <strong>{lowestMonth || "N/A"}</strong>
            </Typography>
          </>
        )}

        {activeTab === 2 && <Typography variant="h5" align="center">🔄 Comparison Mode Content Here</Typography>}
      </Box>
    </Box>
  );
}

export default Analytics;
