const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  exportIncidentReport,
} = require(
  "../controllers/reportController"
);

const router =
  express.Router();

router.get(
  "/export-pdf",
  protect,
  exportIncidentReport
);

module.exports = router;