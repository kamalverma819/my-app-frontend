// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery
} from "@mui/material";
import React, { useState, useEffect } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import Items from "./pages/Items";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Vendors from "./pages/Vendors";
import Customers from "./pages/Customers";
import Profit from "./pages/Profit";
import ProfitList from "./pages/ProfitList";
import Login from "./pages/Login";

const drawerWidth = 0;

const theme = createTheme({
  palette: {
    primary: { main: "#0284c7" }, // blue
    secondary: { main: "#f97316" }, // orange
    background: { default: "#f9fafb" } // light gray
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);

  // Close sidebar on small screens
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Check token
  useEffect(() => {
     const token = localStorage.getItem("authToken");
  setIsAuthenticated(!!token);
  setLoading(false); // done checking
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  if (loading) {
  return null;
}
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated ? (
          <>
            <Topbar
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onLogout={handleLogout}
              sidebarOpen={sidebarOpen}
            />
            <Box sx={{ display: "flex", overflowX: "hidden" }}>
              <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={isMobile}
              />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  backgroundColor: "background.default",
                  minHeight: "100vh",
                  px: { xs: 2, sm: 3 },
                  pt: { xs: 8, sm: 10 },
                  transition: (theme) =>
                    theme.transitions.create("margin", {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.standard,
                    }),
                  ml: isMobile ? 0 : sidebarOpen ? `${drawerWidth}px` : "64px",
                    overflowX: "hidden",
  width: "100%",

                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/items" element={<Items />} />
                  <Route path="/purchases" element={<Purchases />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/profit" element={<Profit />} />
                  <Route path="/profit-list" element={<ProfitList />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </Box>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
