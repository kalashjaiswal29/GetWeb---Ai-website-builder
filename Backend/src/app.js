const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

/* Importing routes */
const authRouter = require("./routes/auth.routes");
const projectRouter = require("./routes/project.routes");

//Auth api Router
app.use("/api/auth", authRouter);

//Project api Router
app.use("/api/projects", projectRouter);

module.exports = app;
