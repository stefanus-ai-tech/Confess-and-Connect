// server/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, specify the frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle joining a room
  socket.on("join_room", (data) => {
    const { roomId, role } = data;
    socket.join(roomId);
    socket.roomId = roomId;
    socket.role = role;
    console.log(`User ${socket.id} joined room: ${roomId} as ${role}`);
    socket.emit("joined_room", roomId);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    const { message, mode } = data;
    const roomId = socket.roomId;
    if (!roomId) return;

    if (mode === "solo") {
      // Trigger burn animation for the sender
      socket.emit("burn_confession");
    } else {
      // Emit message to others in the room
      socket.to(roomId).emit("receive_message", { from: socket.id, message });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
