const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User ID is required "],
    },

    refreshToken: {
      type: String,
      required: [true, "Refresh Token is required"],
    },

    ip: {
      type: String,
      required: [true, "IP address is required"],
    },

    userAgent: {
      type: String,
      required: [true, "User agent is required"],
    },

    revoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const sessionModel = mongoose.model("sessions", sessionSchema);

module.exports = sessionModel;
