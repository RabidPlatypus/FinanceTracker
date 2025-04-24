import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Select, MenuItem, TextField } from "@mui/material";
import { PieChart, Pie, Tooltip, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import API from "../api";
import './Analytics.css';

function Analytics() {
  // State variables
  const [activeTab, setActiveTab] = useState(0);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [highestMonth, setHighestMonth] = useState("");
  const [lowestMonth, setLowestMonth] = useState("");

  const COLORS = ["#2ECC71", "#27AE60", "#1ABC9C", "#16A085", "#3498DB", "#1F618D"];

  // Fetch expenses when the component mounts or when filters change
  useEffect(() => {
    fetchExpenses();
  }, [activeTab, categoryFilter, startDate, endDate]);

  // Fetch expenses from the API
  const fetchExpenses = async () => {
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.start = startDate;
      if (endDate) params.end = endDate;

      const res = await API.get("/expenses/list", { params });
      setExpenses(res.data || []);

      if (activeTab === 1) {
        processTrendData(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setExpenses([]);
    }
  };

  // Process trend data to calculate monthly spending
  const processTrendData = (expensesData) => {
    const monthlyData = {};

    expensesData.forEach((expense) => {
      const date = new Date(expense.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = (monthlyData[key] || 0) + expense.amount;
    });

    const trendArray = Object.keys(monthlyData)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((monthYear) => ({
        monthYear,
        totalSpent: monthlyData[monthYear],
      }));

    if (trendArray.length > 0) {
      const sorted = [...trendArray].sort((a, b) => b.totalSpent - a.totalSpent);
      setHighestMonth(sorted[0]?.monthYear || "N/A");
      setLowestMonth(sorted[sorted.length - 1]?.monthYear || "N/A");
    } else {
      setHighestMonth("N/A");
      setLowestMonth("N/A");
    }

    setTrendData(trendArray);
  };

  // Calculate category data
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Generate pie chart data
  const pieData = Object.keys(categoryData).map((key, index) => ({
    name: key,
    value: categoryData[key],
    color: COLORS[index % COLORS.length],
  }));

  const dailyData = expenses.reduce((acc, expense) => {
    acc[expense.date] = (acc[expense.date] || 0) + expense.amount;
    return acc;
  }, {});

  // Generate bar chart data
  const barData = Object.keys(dailyData)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((date) => ({
      date,
      total: dailyData[date],
    }));

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Analytics 📊
      </Typography>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="fullWidth">
        <Tab label="Spending Overview" />
        <Tab label="Trends Over Time" />
      </Tabs>

      {/* Filters */}
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

            {/* Pie Chart */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>Category Distribution</Typography>
            <Box sx={{ width: "100%", minWidth: "0", overflowX: "auto" }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Bar Chart */}
            <Typography variant="h6" align="center" sx={{ marginTop: 2 }}>Daily Spending</Typography>
            <Box sx={{ width: "100%", minWidth: "0", overflowX: "auto" }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} barCategoryGap="20%">
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}

        {activeTab === 1 && (
          <>
            <Typography variant="h5" align="center">📈 Trends Over Time</Typography>

            {trendData.length > 0 ? (
              <>
                <Box sx={{ width: "100%", minWidth: "0", overflowX: "auto", overflowY: "hidden", marginLeft: "-20px" }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <XAxis dataKey="monthYear" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="totalSpent" stroke="#FF8042" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                {/* Highest and Lowest */}
                <Typography variant="h6" align="center" sx={{ marginTop: 3 }}>
                  🔼 Highest Spending Month: <strong>{highestMonth}</strong>
                </Typography>
                <Typography variant="h6" align="center" sx={{ marginTop: 1 }}>
                  🔽 Lowest Spending Month: <strong>{lowestMonth}</strong>
                </Typography>
              </>
            ) : (
              <Typography align="center" sx={{ marginTop: 3 }}>No trend data available.</Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default Analytics;
