const express = require("express");

const {
  registerUser,
  loginUser,
  generateApiKey,
  getApiKeys,
  deleteApiKey,
  updateIntegrations,
  getIntegrations,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/api-keys", protect, generateApiKey);
router.get("/api-keys", protect, getApiKeys);
router.delete("/api-keys/:id", protect, deleteApiKey);

router.put("/integrations", protect, updateIntegrations);
router.get("/integrations", protect, getIntegrations);

module.exports = router;
