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

// In-memory queues for matchmaking
let confessorsQueue = [];
let listenersQueue = [];

// Utility function to generate unique room IDs
const generateRoomId = () => {
  return `room-${Math.random().toString(36).substr(2, 9)}`;
};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle role selection and initiate matchmaking
  socket.on("select_role", (role) => {
    socket.role = role;

    if (role === "confessor") {
      confessorsQueue.push(socket);
      console.log(`Confessor ${socket.id} added to the queue.`);
      attemptMatchmaking();
    } else if (role === "listener") {
      listenersQueue.push(socket);
      console.log(`Listener ${socket.id} added to the queue.`);
      attemptMatchmaking();
    }
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    const { message, mode } = data;
    const roomId = socket.roomId;

    if (!roomId) {
      socket.emit("error_message", "You are not in a chat room.");
      return;
    }

    if (mode === "solo") {
      // Trigger burn animation for the confessor
      socket.emit("burn_confession");
      // Optionally, notify the listener that the confessor has burned the confession
      socket.to(roomId).emit("confession_burned");
      // Disconnect both users from the room
      socket.leave(roomId);
      // Find the listener socket and leave the room
      const roomSockets = io.sockets.adapter.rooms.get(roomId);
      if (roomSockets) {
        roomSockets.forEach((id) => {
          if (id !== socket.id) {
            const listenerSocket = io.sockets.sockets.get(id);
            if (listenerSocket) {
              listenerSocket.leave(roomId);
            }
          }
        });
      }
    } else if (mode === "listening") {
      // Listener sends "I'm listening" message
      socket.to(roomId).emit("receive_message", {
        from: "Listener",
        message: "I'm listening",
      });
    } else if (mode === "normal") {
      // Confessor sends a regular message
      socket.to(roomId).emit("receive_message", { from: "Confessor", message });
    } else {
      socket.emit("error_message", "Invalid message mode.");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Remove from queues if still present
    if (socket.role === "confessor") {
      confessorsQueue = confessorsQueue.filter((s) => s.id !== socket.id);
    } else if (socket.role === "listener") {
      listenersQueue = listenersQueue.filter((s) => s.id !== socket.id);
    }

    // If the user was in a room, notify the other participant
    if (socket.roomId) {
      socket.to(socket.roomId).emit("participant_disconnected");
    }
  });
});

// Function to attempt matchmaking
const attemptMatchmaking = () => {
  while (confessorsQueue.length > 0 && listenersQueue.length > 0) {
    const confessor = confessorsQueue.shift();
    const listener = listenersQueue.shift();

    const roomId = generateRoomId();

    confessor.join(roomId);
    listener.join(roomId);

    confessor.roomId = roomId;
    listener.roomId = roomId;

    console.log(
      `Matched Confessor ${confessor.id} with Listener ${listener.id} in ${roomId}`
    );

    // Notify both clients that they have been matched
    confessor.emit("matched", { role: "confessor", roomId });
    listener.emit("matched", { role: "listener", roomId });
  }
};

// The "catchall" handler: for any request that doesn't match the above, send back React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
