const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

// Load environment variables dari file .env
dotenv.config();

global.WebSocket = require("ws");

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 5000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const accountRoutes = require("./routes/accountRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");

// Gunakan Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/webhook", webhookRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/knowledge", knowledgeRoutes);

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
