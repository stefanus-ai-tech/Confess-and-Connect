// server/index.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "..", "client", "build")));

// Socket.IO setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Update this in production to your frontend URL
    methods: ["GET", "POST"],
  },
});

// In-memory store to track cooldowns for "I'm Listening" messages
const listeningCooldowns = {};

// Cooldown configuration
const COOLDOWN_DURATION = 10 * 1000; // 10 seconds in milliseconds

// Socket.IO connection handling
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

    if (!roomId) {
      socket.emit("error_message", "You must join a room first.");
      return;
    }

    if (mode === "solo") {
      // Trigger burn animation for the sender
      socket.emit("burn_confession");
    } else if (mode === "listening") {
      // Implement rate limiting for "I'm Listening" messages
      const currentTime = Date.now();

      if (
        listeningCooldowns[socket.id] &&
        currentTime - listeningCooldowns[socket.id] < COOLDOWN_DURATION
      ) {
        const timeLeft = Math.ceil(
          (COOLDOWN_DURATION - (currentTime - listeningCooldowns[socket.id])) /
            1000
        );
        socket.emit(
          "error_message",
          `Please wait ${timeLeft} more second(s) before sending another "I'm listening" message.`
        );
        return;
      }

      // Update the last sent time
      listeningCooldowns[socket.id] = currentTime;

      // Emit the "I'm listening" message to others in the room
      socket
        .to(roomId)
        .emit("receive_message", {
          from: "Listener",
          message: "I'm listening",
        });
      socket.emit("message_sent", "I'm listening"); // Optional: Acknowledge the sender
    } else if (mode === "normal") {
      // Emit message to others in the room
      socket.to(roomId).emit("receive_message", { from: "Confessor", message });
      socket.emit("message_sent", message); // Optional: Acknowledge the sender
    } else {
      socket.emit("error_message", "Invalid message mode.");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Cleanup cooldowns
    delete listeningCooldowns[socket.id];
  });
});

// The "catchall" handler: for any request that doesn't match the above, send back React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
