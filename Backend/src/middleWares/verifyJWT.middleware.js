const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const verifyJwt = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    if (!decoded || !decoded.userId) {
      return res.status(403).json({
        success: false,
        message: "Invalid token payload structure. Access denied.",
      });
    }

    const userExists = await userModel.findById(decoded.userId).select("_id");

    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists or has been suspended.",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log("verifyJwt Error:", err.message);

    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please login again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Malformed or invalid token code.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error occurred during session handshake.",
    });
  }
};

module.exports = verifyJwt;
