const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { protect, superAdminOnly } = require("../middlewares/authMiddleware");

router.use(protect, superAdminOnly);

router.get("/", accountController.getAccounts);
router.post("/", accountController.createAccount);
router.put("/:id", accountController.updateAccount);
router.patch("/:id/toggle-status", accountController.deactiveAccount);

module.exports = router;
