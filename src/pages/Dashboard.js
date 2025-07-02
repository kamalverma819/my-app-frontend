import { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import {
  Inventory,
  People,
  Store,
  ShoppingCart,
  AttachMoney,
} from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalItems: 0,
  });

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
  axios.get(`${BASE_URL}/dashboard/stats`)
      .then(res => setStats(res.data))
      .catch(err => console.error("Dashboard fetch error", err));
  }, []);

  const cardData = [
    {
      title: "Total Purchases",
      value: stats.totalPurchases,
      icon: <ShoppingCart sx={{ fontSize: 60, color: "#1976d2" }} />,
      color: "#e3f2fd",
      route: "/purchases",
    },
    {
      title: "Total Sales",
      value: stats.totalSales,
      icon: <AttachMoney sx={{ fontSize: 60, color: "#2e7d32" }} />,
      color: "#e8f5e9",
      route: "/sales",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: <People sx={{ fontSize: 60, color: "#6a1b9a" }} />,
      color: "#f3e5f5",
      route: "/customers",
    },
    {
      title: "Total Vendors",
      value: stats.totalVendors,
      icon: <Store sx={{ fontSize: 60, color: "#ff6f00" }} />,
      color: "#fff3e0",
      route: "/vendors",
    },
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: <Inventory sx={{ fontSize: 60, color: "#c62828" }} />,
      color: "#ffebee",
      route: "/items",
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        📊 Dashboard
      </Typography>
      <Grid container spacing={4}>
        {cardData.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link to={stat.route} style={{ textDecoration: "none" }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 4,
                  backgroundColor: stat.color,
                  minHeight: 140,
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Box sx={{ mr: 4 }}>{stat.icon}</Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
