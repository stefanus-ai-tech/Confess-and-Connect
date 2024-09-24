// client/src/App.js
import React, { useState } from "react";
import io from "socket.io-client";
import RoleSelection from "./components/RoleSelection";
import ChatWindow from "./components/ChatWindow";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, CircularProgress, Typography, Box } from "@mui/material";

// Connect to the backend server
const socket = io(); // Automatically connects to the current host

// Define your theme here
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    error: {
      main: "#d32f2f",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
});

function App() {
  const [role, setRole] = useState(null);
  const [matched, setMatched] = useState(false);
  const [chatRole, setChatRole] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [error, setError] = useState("");

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    socket.emit("select_role", selectedRole);
  };

  // Listen for the 'matched' event from the server
  socket.on("matched", (data) => {
    setChatRole(data.role);
    setRoomId(data.roomId);
    setMatched(true);
  });

  // Listen for error messages from the server
  socket.on("error_message", (msg) => {
    setError(msg);
  });

  // Listen for when the confession is burned
  socket.on("confession_burned", () => {
    setMatched(false);
    setRoomId(null);
    setChatRole(null);
    // Optionally, notify the user or redirect them
  });

  // Listen for participant disconnection
  socket.on("participant_disconnected", () => {
    setMatched(false);
    setRoomId(null);
    setChatRole(null);
    // Optionally, notify the user
    alert("Your chat partner has disconnected.");
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!role ? (
        <RoleSelection selectRole={selectRole} />
      ) : !matched ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "#fff",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Waiting for a match...
          </Typography>
          <CircularProgress color="error" />
        </Box>
      ) : (
        <ChatWindow
          socket={socket}
          role={chatRole}
          roomId={roomId}
          onBurnConfession={() => {
            // Handle actions after burning confession if needed
          }}
        />
      )}
      {/* Error Notification */}
      {error && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "error.main",
            color: "#fff",
            px: 2,
            py: 1,
            borderRadius: "4px",
          }}
        >
          {error}
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
