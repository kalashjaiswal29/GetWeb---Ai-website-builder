const { validationResult, body } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");
const sessionModel = require("../models/session.model");
const { Timestamp } = require("mongodb");

const secureCookie = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

/**
 * @name registerUserController
 * @description Registers a new user, requires (name , email , password)
 * @access public
 */

const registerUserController = [
  // 1. Input Validation
  body("name").notEmpty().withMessage("Name required").trim().escape(),

  body("email").isEmail().normalizeEmail().withMessage("Enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must contain at least 6 characters")
    .trim(),

  // 2. Main Async Controller Function
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, password } = req.body;

      console.log(req.body);

      const emailExist = await userModel.findOne({
        email: email,
      });

      if (emailExist) {
        return res
          .status(400)
          .json({ success: false, message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
      });

      const session = await sessionModel.create({
        userId: user._id,
        refreshToken: " ",
        // refreshToken: refreshTokenHashed, update after creating session
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      const refreshToken = jwt.sign(
        { userId: user._id, sessionId: session._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" },
      );

      const refreshTokenHashed = await bcrypt.hash(refreshToken, 12);

      session.refreshToken = refreshTokenHashed;
      await session.save();

      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" },
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          userId: user._id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      });
    } catch (err) {
      console.log("RegisterController error : ", err.message, err);
      return res.status(500).json({
        success: false,
        message: "server error",
      });
    }
  },
];

/**
 * @name loginUserController
 * @description Login an existing user, expects email and password
 * @access public
 */
async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const session = await sessionModel.create({
      userId: user._id,
      refreshToken: " ",
      // refreshToken: refreshTokenHashed, update after creating refresh token
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const refreshToken = jwt.sign(
      { userId: user._id, sessionId: session._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    const refreshTokenHashed = await bcrypt.hash(refreshToken, 12);

    session.refreshToken = refreshTokenHashed;
    await session.save();

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      success: true,
      message: "User logged in successfully",
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    });
  } catch (err) {
    console.log("LoginController error : ", err.message);
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

/**
 * @name refreshTokenController
 * @description refreshes access token, also update the refresh token in the session, expects refresh token in cookie
 * @access public
 */
async function refreshTokenController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    //store session id in refresh token to findone

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    //now it is required because when new refresh token is generated for the same user and updated in session store but if someone has old refresh token can also generate accesstoken hence we verify hashed refresh token in session also

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      session.refreshToken,
    );

    if (!isRefreshTokenValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "15m",
      },
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, sessionId: session._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );

    const newRefreshTokenHashed = await bcrypt.hash(newRefreshToken, 12);

    session.refreshToken = newRefreshTokenHashed;
    await session.save();


    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: accessToken,
    });
  } catch (err) {
    console.log("Error in refreshTokenController", err.message, err);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

/**
 * @name getMeController
 * @description returns user details, expects access token from headers in fetch statement
 * @access private
 */
async function getMeController(req, res) {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(201).json({
      success: true,
      user: { userId: user._id, name: user.name, email: user.email },
      message: "User fetched successfully",
    });
  } catch (err) {
    console.log("getMeController Error", err.message);

    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

/**
 * @name logOutController
 * @description logs out user from expects accessToken, refreshToken, and changes revoked to true
 * @access private
 */
async function logOutController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY); //contains userId and sessionId

    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    //now it is required because when new refresh token is generated for the same user and updated in session store but if someone has old refresh token can also generate accesstoken hence we verify hashed refresh token in session also

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      session.refreshToken,
    );

    if (!isRefreshTokenValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    session.revoked = true;

    await session.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.log("logOutController Error", err.message);

    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

/**
 * @name logOutFromAllController
 * @description logs out user from all devices expects accessToken, refreshToken, and changes revoked to true
 * @access private
 */
async function logOutFromAllController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY); //contains userId and sessionId

    await sessionModel.updateMany(
      {
        userId: decoded.userId,
        revoked: false,
      },
      {
        $set: {
          revoked: true,
        },
      },
    );
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "Logged out from all devices successfully.",
    });
  } catch (err) {
    console.log("Error in logOutFromAllController ", err.message);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

const healthCheckController = (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Server is alive",
    timestamp: new Date().toISOString()  
  })
}

module.exports = {
  registerUserController,
  loginUserController,
  refreshTokenController,
  getMeController,
  logOutController,
  logOutFromAllController,
  healthCheckController
};
