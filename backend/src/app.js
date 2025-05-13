const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ message: "Chaucherita backend is running." });
});

module.exports = app;
