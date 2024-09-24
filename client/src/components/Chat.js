// client/src/components/Chat.js
import React, { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import { Container, Typography } from "@mui/material";

const Chat = ({ socket, role, roomId }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Listen for confirmation of joining the room
    socket.on("joined_room", (joinedRoomId) => {
      if (joinedRoomId === roomId) {
        setConnected(true);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.off("joined_room");
    };
  }, [socket, roomId]);

  if (!connected) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6">Joining room...</Typography>
      </Container>
    );
  }

  return <ChatWindow socket={socket} role={role} />;
};

export default Chat;
