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
app.use(cors());
// app.use(
//   cors({
//     origin: "*", // Bebaskan origin untuk sementara
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     // 👇 Wajib daftarkan header ngrok di sini beserta header standar lainnya
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "ngrok-skip-browser-warning",
//     ],
//   }),
// );
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

// Koneksi ke MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// Route sederhana untuk tes
app.get("/", (req, res) => {
  res.send("Dashboard API is running!");
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`⚡ Server is running on port ${PORT}!`);
});

module.exports = app;
