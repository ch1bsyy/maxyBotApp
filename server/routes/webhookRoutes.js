const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");

// POST /api/v1/webhook/n8n
router.post("/n8n", webhookController.handleN8nWebhook);

// GET /api/v1/webhook/check-status/:phone_number
router.get(
  "/check-status/:phone_number",
  webhookController.checkHandlingStatus,
);

module.exports = router;
