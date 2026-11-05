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
const { validateRegister, validateLogin } = require("../middleware/validateInput");

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

router.post("/logout", protect, (req, res) => {
  res.status(200).json({ message: "Logged out successfully. Please discard your token client-side." });
});

router.post("/api-keys", protect, generateApiKey);
router.get("/api-keys", protect, getApiKeys);
router.delete("/api-keys/:id", protect, deleteApiKey);

router.put("/integrations", protect, updateIntegrations);
router.get("/integrations", protect, getIntegrations);

module.exports = router;
