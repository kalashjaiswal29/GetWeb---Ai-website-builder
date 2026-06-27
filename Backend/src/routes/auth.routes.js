const { Router } = require("express");

const authController = require("../controllers/auth.controller");


const authRouter = Router();

/**
 * @path /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @path /api/auth/login
 * @description Login existing user
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @path /api/auth/refresh-token
 * @description use to refresh access token
 * @access public
 */
authRouter.post("/refresh-token", authController.refreshTokenController);

/**
 * @path /api/auth/get-me
 * @description used to get user info using access token
 * @access private
 */
authRouter.get("/get-me", authController.getMeController);

/**
 * @path /api/auth/logout
 * @description logs out the user from present device
 * @access private
 */
authRouter.post("/logout", authController.logOutController);

/**
 * @path /api/auth/logout-all
 * @description logs out the user from all devices
 * @access public
 */
authRouter.post("/logout-all", authController.logOutFromAllController);

module.exports = authRouter;
