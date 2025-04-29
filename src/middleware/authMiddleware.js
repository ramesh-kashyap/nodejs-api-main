const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    // Check if JWT_SECRET is properly loaded from environment
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not found in .env file!");
      return res.status(500).json({ error: "Server misconfiguration: Missing JWT_SECRET" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // make sure JWT_SECRET is loaded from .env

    // Log decoded token for debugging purposes
    console.log("Decoded JWT:", decoded);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Optionally: remove sensitive fields like password
    const { password, ...userData } = user.get({ plain: true });

    req.user = userData; // ⬅️ attach sanitized user data to the request object

    next();
  } catch (error) {
    // Improved error handling: log the full error and return detailed error message
    console.error("Authentication error:", error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token", details: error.message });
    }

    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = authMiddleware;
