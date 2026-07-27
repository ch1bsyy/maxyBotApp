const express = require("express");
const router = express.Router();
const guideController = require("../controllers/guideController");
const { protect, superAdminOnly } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/", guideController.getAllGuides);

// Superadmin
router.post("/", superAdminOnly, guideController.createGuide);
router.put("/:id", superAdminOnly, guideController.updateGuide);
router.delete("/:id", superAdminOnly, guideController.deleteGuide);

module.exports = router;
