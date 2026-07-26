const express = require("express");
const router = express.Router();
const knowledgeController = require("../controllers/knowledgeController");
const { protect } = require("../middlewares/authMiddleware");

router.param("table", knowledgeController.validateTable);

router.get("/:table", knowledgeController.getAllData);

router.use(protect);
router.post("/:table", knowledgeController.createData);
router.put("/:table/:id", knowledgeController.updateData);
router.delete("/:table/:id", knowledgeController.deleteData);

module.exports = router;
