const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("Connecting to database........");

    await mongoose.connect(process.env.mongoURI);

    console.log("Connnectd to database");
  } catch (err) {
    console.log(err);
  }
}

module.exports = connectDB;
