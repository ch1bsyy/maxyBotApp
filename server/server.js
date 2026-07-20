const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables dari file .env
dotenv.config();

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const accountRoutes = require("./routes/accountRoutes");

// Gunakan Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/webhook", webhookRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/accounts", accountRoutes);

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Successfully connected to MongoDB");
  } catch (err) {
    console.error("Connection error", err);
  }
};

connectDB();

// Route sederhana untuk tes
app.get("/", (req, res) => {
  res.send("Dashboard API is running!");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`⚡ Server is running locally on port ${PORT}!`);
  });
}

module.exports = app;
