import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { Lock as LockIcon } from "@mui/icons-material";
import { useState } from "react";
import api from "../api/client";

const Login = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/login", {
        email: credentials.email.trim(),
        password: credentials.password,
      });
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp", {
        email: credentials.email.trim(),
        otp: credentials.otp.trim(),
      });
      // Store token immediately so it's available for all API calls after redirect
      const token = res.data?.token ?? res.data?.data?.token;
      if (!token) {
        setError("Invalid response: no token received");
        return;
      }
      localStorage.setItem("authToken", token);
      onLogin(token);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setCredentials((c) => ({ ...c, otp: "" }));
    setError("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4a148c 0%, #ff6f00 100%)",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LockIcon color="primary" sx={{ fontSize: 50 }} />
          <Typography variant="h4" component="h1">
            {step === 1 ? "Sign In" : "Verify OTP"}
          </Typography>
        </Box>

        {step === 1 ? (
          <form onSubmit={handleSubmitStep1}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmitStep2}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={credentials.email}
              disabled
            />
            <TextField
              label="OTP"
              fullWidth
              margin="normal"
              placeholder="Enter 6-digit OTP"
              value={credentials.otp}
              onChange={(e) =>
                setCredentials({ ...credentials, otp: e.target.value })
              }
              inputProps={{ maxLength: 6 }}
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button
              fullWidth
              sx={{ mt: 1 }}
              onClick={handleBackToStep1}
              disabled={loading}
            >
              Back
            </Button>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
