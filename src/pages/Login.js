import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useState } from "react";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Replace with actual API call
    onLogin("dummy_token"); 
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4a148c 0%, #ff6f00 100%)'
    }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockIcon color="primary" sx={{ fontSize: 50 }} />
          <Typography variant="h4" component="h1">
            Sign In
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large" 
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;