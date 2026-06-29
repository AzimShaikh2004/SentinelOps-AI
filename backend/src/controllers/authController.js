const User = require("../models/User");
const ApiKey = require("../models/ApiKey");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const generateApiKey = async (req, res) => {
  try {
    const { description } = req.body;
    const rawKey = `sentinel_${crypto.randomBytes(24).toString("hex")}`;

    const apiKey = await ApiKey.create({
      key: rawKey,
      description: description || "Default Agent Key",
      user: req.user.id,
    });

    res.status(201).json({
      message: "API Key generated successfully",
      apiKey: {
        id: apiKey._id,
        key: apiKey.key,
        description: apiKey.description,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(apiKeys);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!apiKey) {
      return res.status(404).json({ message: "API key not found" });
    }
    res.status(200).json({ message: "API Key revoked successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateIntegrations = async (req, res) => {
  try {
    const { slackWebhookUrl, discordWebhookUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { slackWebhookUrl, discordWebhookUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Integrations updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getIntegrations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("slackWebhookUrl discordWebhookUrl");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  generateApiKey,
  getApiKeys,
  deleteApiKey,
  updateIntegrations,
  getIntegrations,
};
