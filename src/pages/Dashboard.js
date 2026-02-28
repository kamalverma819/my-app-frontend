import { useEffect, useState } from "react";
import {
  Inventory,
  People,
  Store,
  ShoppingCart,
  AttachMoney,
} from "@mui/icons-material";
import api from "../api/client";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalItems: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        // Error fetching dashboard stats
      }
    };
    fetchStats();
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
    <div style={{ padding: '32px' }}>
      <h1 style={{ marginBottom: '16px', fontWeight: 'bold', marginTop: 0 }}>
        📊 Dashboard
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
        {cardData.map((stat, index) => (
          <div key={index} style={{ gridColumn: 'span 12 / span 4' }}>
            <Link to={stat.route} style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: '32px',
                  display: "flex",
                  alignItems: "center",
                  borderRadius: '16px',
                  backgroundColor: stat.color,
                  minHeight: '140px',
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ marginRight: '32px' }}>{stat.icon}</div>
                <div>
                  <h2 style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>
                    {stat.value}
                  </h2>
                  <h3 style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
                    {stat.title}
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
