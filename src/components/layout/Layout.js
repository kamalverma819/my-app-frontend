import React, { useState } from "react";
import { Box, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 240;

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Topbar
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onLogout={() => {
          // handle logout here
          console.log("Logout clicked");
        }}
      />

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
    ml: isMobile ? 0 : sidebarOpen ? "240px" : "57px",
  }}
>

        {/* Push content below Topbar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
