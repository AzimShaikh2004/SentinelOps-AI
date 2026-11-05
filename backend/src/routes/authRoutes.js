const express = require("express");
const rateLimit = require("express-rate-limit");

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

// Specific rate limiter on login and registration endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validateRegister, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);

router.post("/logout", protect, (req, res) => {
  res.status(200).json({ message: "Logged out successfully. Please discard your token client-side." });
});

router.post("/api-keys", protect, generateApiKey);
router.get("/api-keys", protect, getApiKeys);
router.delete("/api-keys/:id", protect, deleteApiKey);

router.put("/integrations", protect, updateIntegrations);
router.get("/integrations", protect, getIntegrations);

module.exports = router;
