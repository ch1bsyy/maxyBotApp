const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /api/v1/auth/login
router.post("/login", authController.login);

router.put("/profile", authController.updateProfile);
router.put("/change-password", authController.changePassword);

module.exports = router;
