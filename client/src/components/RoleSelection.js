// client/src/components/RoleSelection.js
import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  width: "200px",
  height: "60px",
  margin: "10px",
  fontSize: "18px",
}));

const RoleSelection = ({ selectRole }) => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 10 }}>
      <Typography variant="h4" gutterBottom sx={{ color: "#fff" }}>
        Select Your Role
      </Typography>
      <Box>
        <StyledButton
          variant="contained"
          color="error"
          onClick={() => selectRole("confessor")}
        >
          Confessor
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          onClick={() => selectRole("listener")}
        >
          Listener
        </StyledButton>
      </Box>
    </Container>
  );
};

export default RoleSelection;
