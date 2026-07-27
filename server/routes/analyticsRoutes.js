const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, superAdminOnly } = require("../middlewares/authMiddleware");

router.use(protect, superAdminOnly);

router.get("/super-overview", analyticsController.getSuperOverview);

module.exports = router;
