const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/metrics", dashboardController.getDashboardMetrics);
router.get("/leads", dashboardController.getLeads);
router.get("/chat-history/:phone_number", dashboardController.getChatHistory);

router.put(
  "/update-handling/:phone_number",
  dashboardController.updateHandlingMode,
);

router.get("/cities", dashboardController.getCities);

module.exports = router;
