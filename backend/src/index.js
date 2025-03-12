const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());  // ✅ Enables JSON parsing
app.use(cors());

app.use("/auth", authRoutes);  // ✅ Registers Auth Routes
app.use("/expenses", expenseRoutes);
app.use("/budget", budgetRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
