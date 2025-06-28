// src/components/layout/Sidebar.js
import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  useTheme,
  useMediaQuery,
  styled,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as PurchaseIcon,
  PointOfSale as SalesIcon,
  PersonOutline as VendorsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Group as CustomersIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? drawerWidth : theme.spacing(7) + 1,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    width: open ? drawerWidth : theme.spacing(7) + 1,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: "hidden",
    backgroundColor: "#fdfdfd",
    color: "#1e293b",
    borderRight: "1px solid #e2e8f0",
  },
}));

const Sidebar = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Inventory", icon: <InventoryIcon />, path: "/items" },
    { text: "Purchases", icon: <PurchaseIcon />, path: "/purchases" },
    { text: "Sales", icon: <SalesIcon />, path: "/sales" },
    { text: "Vendors", icon: <VendorsIcon />, path: "/vendors" },
    { text: "Customers", icon: <CustomersIcon />, path: "/customers" },
    { text: "Profit List", icon: <AttachMoneyIcon />, path: "/profit-list" },
  ];

  const settingsItems = [
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  const renderListItem = (item) => {
    const isSelected = location.pathname === item.path;

    return (
      <Tooltip
        title={!open ? item.text : ""}
        placement="right"
        arrow
        key={item.text}
        componentsProps={{
          tooltip: {
            sx: {
              backgroundColor: "#334155",
              color: "#fff",
              fontSize: "0.75rem",
              borderRadius: 1,
            },
          },
        }}
      >
        <ListItem
          button
          component={Link}
          to={item.path}
          selected={isSelected}
          sx={{
            px: 2,
            py: 1.2,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            color: "#1e293b",
            backgroundColor: isSelected ? "#e0f2fe" : "transparent",
            "&:hover": {
              backgroundColor: "#f1f5f9",
            },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon
            sx={{
              color: isSelected ? "#0284c7" : "#64748b",
              minWidth: "40px",
            }}
          >
            {item.icon}
          </ListItemIcon>
          {open && (
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: isSelected ? "bold" : "normal",
                fontSize: "0.95rem",
              }}
            />
          )}
        </ListItem>
      </Tooltip>
    );
  };

  return (
    <StyledDrawer
      variant={isSmallScreen ? "temporary" : "permanent"}
      open={open}
      onClose={onClose}
    >
      {!isSmallScreen && (
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {open && (
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontSize: "1rem", color: "#0284c7" }}
            >
              NEW LOTUS
            </Typography>
          )}
          <IconButton onClick={onClose} sx={{ color: "#64748b" }}>
            {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
      )}

      <Divider sx={{ borderColor: "#e2e8f0", my: 1 }} />
      <List>{menuItems.map(renderListItem)}</List>
      <Divider sx={{ borderColor: "#e2e8f0", my: 1 }} />
      <List>{settingsItems.map(renderListItem)}</List>
    </StyledDrawer>
  );
};

export default Sidebar;
