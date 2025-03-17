const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

// ✅ Allow requests only from your frontend
app.use(cors({
  origin: "https://financetracker-x1143-a5d8e.web.app", // Your Firebase frontend URL
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// ✅ Handle preflight requests for all routes
app.options("*", cors());

app.use("/auth", authRoutes);  // ✅ Registers Auth Routes
app.use("/expenses", expenseRoutes);
app.use("/budget", budgetRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
