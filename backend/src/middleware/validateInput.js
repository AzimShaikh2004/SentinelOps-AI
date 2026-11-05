/**
 * Input Validation Middleware
 * Provides request body validation for auth routes without external dependencies.
 */

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedName || trimmedName.length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!trimmedEmail) {
    errors.push("A valid email address is required.");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      errors.push("Email format is invalid.");
    }
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required.");
  } else {
    if (password.length < 8) errors.push("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one digit.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  // Sanitize inputs
  req.body.name = trimmedName;
  req.body.email = trimmedEmail;

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!trimmedEmail) {
    errors.push("Email is required.");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body.email = trimmedEmail;

  next();
};

module.exports = { validateRegister, validateLogin };
