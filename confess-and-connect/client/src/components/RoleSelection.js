// src/components/RoleSelection.js
import React, { useState } from "react";
import { Button, Container, Typography, Box, TextField } from "@mui/material";

const RoleSelection = ({ selectRole }) => {
  const [roomId, setRoomId] = useState("");

  const handleSelectRole = (role) => {
    if (roomId.trim() === "") {
      alert("Please enter a Room ID to connect.");
      return;
    }
    selectRole(role, roomId);
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h3" gutterBottom>
        Confess & Connect
      </Typography>
      <Box sx={{ mt: 5 }}>
        <TextField
          label="Room ID"
          variant="outlined"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          fullWidth
          sx={{
            mb: 3,
            "& .MuiInputLabel-root": { color: "#ffffff" }, // White label
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#d32f2f" }, // Red border
              "&:hover fieldset": { borderColor: "#ff6659" }, // Lighter red on hover
              "&.Mui-focused fieldset": { borderColor: "#ff6659" }, // Lighter red on focus
              backgroundColor: "#1e1e1e", // Dark input background
              color: "#ffffff", // White text
            },
          }}
        />
        <Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => handleSelectRole("confessor")}
            sx={{
              m: 2,
              padding: "10px 30px",
              fontSize: "16px",
              textTransform: "none",
            }}
          >
            Confessor
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => handleSelectRole("listener")}
            sx={{
              m: 2,
              padding: "10px 30px",
              fontSize: "16px",
              textTransform: "none",
              borderColor: "#1976d2",
              "&:hover": {
                borderColor: "#63a4ff",
              },
            }}
          >
            Listener
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RoleSelection;
