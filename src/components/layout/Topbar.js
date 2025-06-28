// src/components/layout/Topbar.js
import { AppBar, Toolbar, Typography, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const Topbar = ({ toggleSidebar, onLogout, sidebarOpen }) => {
  return (
    <AppBar
      position="fixed"
      elevation={2}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#ffffff",
        color: "#1e293b",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, color: "#64748b" }}
        >
          {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            letterSpacing: 0.5,
            fontSize: "1.05rem",
          }}
        >
          NEW LOTUS TEXTILE ELECTRONICS
        </Typography>

        <Button
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          sx={{
            color: "#0284c7",
            borderColor: "#0284c7",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#f0f9ff",
              borderColor: "#0284c7",
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
