// src/App.js
// client/src/App.js
import React, { useState } from "react";
import io from "socket.io-client";
import RoleSelection from "./components/RoleSelection";
import ChatWindow from "./components/ChatWindow";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// Connect to the backend server (same origin)
const socket = io(); // Automatically connects to the current host

// Define a custom theme with black and red palette
const theme = createTheme({
  palette: {
    mode: "dark", // Enable dark mode
    primary: {
      main: "#d32f2f", // Red color
    },
    secondary: {
      main: "#1976d2", // Blue color (can be adjusted as needed)
    },
    background: {
      default: "#121212", // Dark background
      paper: "#1e1e1e", // Slightly lighter dark for paper elements
    },
    text: {
      primary: "#ffffff", // White text
      secondary: "#b0b0b0", // Grey text
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

function App() {
  const [role, setRole] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const selectRole = (selectedRole, enteredRoomId) => {
    setRole(selectedRole);
    setRoomId(enteredRoomId);
    socket.emit("join_room", { roomId: enteredRoomId, role: selectedRole });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!role ? (
        <RoleSelection selectRole={selectRole} />
      ) : (
        <ChatWindow
          socket={socket}
          role={role}
          onBurnConfession={() => {
            // Optional: Handle actions after burning confession
          }}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
