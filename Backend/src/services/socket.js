const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ,
      methods: ["GET", "POST"],
    },
  });

  //Every single time a user refreshes their browser tab, closes a laptop lid, switches tabs, or briefly loses their internet connection, their old socket connection instantly dies, and they get a brand new socket.id.

  io.on("connection", (socket) => {
    console.log("Socket connected with socket id", socket.id);

    socket.on("join-user-room", (userId) => {
      socket.join(userId.toString());
      console.log(`User with ${socket.id} joined the room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket connection disconnect with socketId ", socket.id);
    });
  });
  return io ;
};


const emitToUser = (userId, eventName, data) => {
  if(io){
    io.to(userId.toString()).emit(eventName, data)
  }else{
    console.log("Socket not initiallized yet.")
  }
}

module.exports = { initSocket, emitToUser };

//What does userId do inside this function? (The Action)Inside the server listener, userId acts as a naming label to create an exclusive, isolated channel.When your code executes socket.join(userId.toString()), Socket.io sets up a virtual lookup table in the server's memory that looks like this:Virtual Room Name (User ID Key)
//  Subscribed Active            Socket IDs (Browser Tabs)      "65d2f89b14c3a2001a88b1f2"       ["oB_X49Ad...", "K9_Zms21..."]"65e8c11a23b1c1002b99c3a4"       ["pW_Q78Lm..."]

// By using the userId as the room name, you are turning a chaotic, random connection string (socket.id) into a structured, predictable name based on your database entity.
