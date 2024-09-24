// client/src/components/ChatWindow.js
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

const ChatWindow = ({ socket, role, roomId, onBurnConfession }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [burn, setBurn] = useState(false);
  const [error, setError] = useState("");

  // State variables for "I'm Listening" button
  const [canSendListening, setCanSendListening] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownDuration = 10; // Cooldown duration in seconds
  const cooldownRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        { from: data.from, message: data.message },
      ]);

      // Enable the "I'm Listening" button when a new message is received from Confessor
      if (role === "listener" && data.from === "Confessor") {
        setCanSendListening(true);
      }
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

    // Listen for confession burned notification
    socket.on("confession_burned", () => {
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

    // Listen for error messages from the server
    socket.on("error_message", (msg) => {
      setError(msg);
    });

    // Listen for message sent acknowledgments
    socket.on("message_sent", (msg) => {
      // Optionally handle acknowledgments
      console.log("Message sent:", msg);
    });

    // Listen for participant disconnection
    socket.on("participant_disconnected", () => {
      // Optionally handle disconnections
      alert("Your chat partner has disconnected.");
    });

    // Cleanup on unmount
    return () => {
      socket.off("receive_message");
      socket.off("burn_confession");
      socket.off("confession_burned");
      socket.off("connect_error");
      socket.off("error_message");
      socket.off("message_sent");
      socket.off("participant_disconnected");
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [socket, role, onBurnConfession]);

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
      mode: "listening", // Updated mode
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, { from: "you", message: "I'm listening" }]);

    // Disable the button and start cooldown
    setCanSendListening(false);
    setCooldown(cooldownDuration);

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
                {msg.from === "you"
                  ? "Y"
                  : msg.from === "Confessor"
                  ? "C"
                  : "L"}
              </Avatar>
              <ListItemText
                primary={
                  msg.from === "you"
                    ? "You"
                    : msg.from === "Confessor"
                    ? "Confessor"
                    : "Listener"
                }
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
            placeholder="Type your confession..."
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            color="error"
            startIcon={<LocalFireDepartmentIcon />}
            onClick={sendListening}
            disabled={!canSendListening || cooldown > 0}
            sx={{
              textTransform: "none",
              fontSize: "16px",
              padding: "10px 20px",
              backgroundColor:
                canSendListening && cooldown === 0 ? "#d32f2f" : "#555",
              transition: "background-color 0.3s ease, opacity 0.3s ease",
              "&:hover": {
                backgroundColor:
                  canSendListening && cooldown === 0 ? "#ff6659" : "#555",
              },
              opacity: canSendListening ? 1 : 0.6,
            }}
          >
            {cooldown > 0 ? `I'm Listening (${cooldown})` : "I'm Listening"}
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
