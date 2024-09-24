// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment"; // Correct Icon Import

const ChatWindow = ({ socket, role, onBurnConfession }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [burn, setBurn] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        { from: data.from, message: data.message },
      ]);
    });

    // Listen for burn confession
    socket.on("burn_confession", () => {
      setBurn(true);
      setTimeout(() => {
        setBurn(false);
        setMessages([]);
        if (onBurnConfession) onBurnConfession();
      }, 3000); // Duration of burn.gif
    });

    // Listen for connection errors
    socket.on("connect_error", () => {
      setError("Connection failed. Please try again.");
    });

    // Cleanup on unmount
    return () => {
      socket.off("receive_message");
      socket.off("burn_confession");
      socket.off("connect_error");
    };
  }, [socket, onBurnConfession]);

  useEffect(() => {
    // Scroll to the bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, burn]);

  const sendMessage = () => {
    if (input.trim() === "") return;
    const messageData = {
      message: input,
      mode: "normal",
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, { from: "you", message: input }]);
    setInput("");
  };

  const sendListening = () => {
    const messageData = {
      message: "I'm listening",
      mode: "normal",
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, { from: "you", message: "I'm listening" }]);
  };

  const sendBurnConfession = () => {
    socket.emit("send_message", { message: "", mode: "solo" });
  };

  const handleClose = () => {
    setError("");
  };

  if (burn) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
        <img
          src="/burn.gif"
          alt="Burning Confession"
          width="300"
          height="300"
        />
        <Typography variant="h6" sx={{ mt: 2, color: "#fff" }}>
          Your confession has been burned. It’s gone now.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ color: "#fff" }}>
        {role === "confessor" ? "Confessor" : "Listener"}
      </Typography>
      <Box
        sx={{
          height: "60vh",
          border: "1px solid #444", // Darker border
          borderRadius: "8px",
          p: 2,
          overflowY: "auto",
          backgroundColor: "#1e1e1e", // Dark background
        }}
      >
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index} alignItems="flex-start">
              <Avatar
                sx={{
                  bgcolor: msg.from === "you" ? "error.main" : "primary.main",
                  mr: 2,
                }}
              >
                {msg.from === "you" ? "Y" : "L"}
              </Avatar>
              <ListItemText
                primary={msg.from === "you" ? "You" : "Listener"}
                secondary={msg.message}
                sx={{
                  textAlign: msg.from === "you" ? "right" : "left",
                  color: "#fff", // White text for readability
                }}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {role === "confessor" ? (
        <Box sx={{ display: "flex", mt: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Type your message..."
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            sx={{
              input: { color: "#fff" }, // White text in input
              backgroundColor: "#333", // Dark input background
              borderRadius: "4px",
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#d32f2f" }, // Red border
                "&:hover fieldset": { borderColor: "#ff6659" }, // Lighter red on hover
                "&.Mui-focused fieldset": { borderColor: "#ff6659" }, // Lighter red on focus
              },
            }}
          />
          <IconButton color="error" onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LocalFireDepartmentIcon />}
            onClick={sendListening}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              padding: "10px 20px",
              backgroundColor: "#d32f2f",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: "#ff6659",
              },
            }}
          >
            I'm Listening
          </Button>
        </Box>
      )}

      {role === "confessor" && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LocalFireDepartmentIcon />} // Updated Icon
            onClick={sendBurnConfession}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              padding: "10px 20px",
              backgroundColor: "#d32f2f",
              transition: "background-color 0.3s ease",
              "&:hover": {
                backgroundColor: "#ff6659",
              },
            }}
          >
            Burn Confession
          </Button>
        </Box>
      )}

      {/* Error Notification */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ChatWindow;
