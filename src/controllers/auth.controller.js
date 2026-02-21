const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await authService.registerUser({ name, email, password });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const data = await authService.loginUser({ email, password });

    res.json({
      message: "Login successful",
      ...data,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = { register , login };