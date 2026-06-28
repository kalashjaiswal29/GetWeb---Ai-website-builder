require("dotenv").config();
/**
 * By placing require("dotenv").config(); at the very top of your entry file (like server.js), Node.js reads that file and makes those variables safely accessible anywhere in your project via code like process.env.MONGO_URI.
 */

const { createServer } = require("http");

const app = require("./src/app");
const connectDB = require("./src/config/database.js");
const { create } = require("./src/models/user.model.js");
const {initSocket} = require('./src/services/socket.js')
const PORT = process.env.PORT ;

const server = createServer(app);

initSocket(server) ;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
});
