// src/components/items/ItemList.js
import React from "react";
import {
  DataGrid,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import {
  Box, Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ItemList = ({ items, searchTerm, onEdit, fetchItems }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Then use:
await axios.delete(`${BASE_URL}/items/${id}`);
        fetchItems(); // Refresh after delete
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      field: "name",
      headerName: "Item Name",
      width: 200,
      renderCell: (params) => (
        <Typography fontWeight="bold" color="primary.main">
          {params.value}
        </Typography>
      ),
    },
    {
      field: "hsnCode",
      headerName: "HSN Code",
      width: 120,
      renderCell: (params) => (
        <Typography fontSize="0.9rem">{params.value}</Typography>
      ),
    },
    {
      field: "buyingPrice",
      headerName: "Buying Price",
      width: 140,
      renderCell: (params) => (
        <Typography fontWeight={500} color="#2e7d32">
          ₹{params.value}
        </Typography>
      ),
    },
    {
      field: "sellingPrice",
      headerName: "Selling Price",
      width: 140,
      renderCell: (params) => (
        <Typography fontWeight={500} color="#d32f2f">
          ₹{params.value}
        </Typography>
      ),
    },
    {
      field: "gstRate",
      headerName: "GST %",
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight="bold" color="text.secondary">
          {params.value}%
        </Typography>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight={params.value < 10 ? "bold" : 500} color={params.value < 10 ? "error.main" : "text.primary"}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon color="primary" />}
          label="Edit"
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
        />
      ],
    }
  ];


  return (
    <Box sx={{ height: 500, width: "100%", mt: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 5,
            height: 30,
            backgroundColor: "#1976d2",
            borderRadius: 1,
            mr: 1.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#333",
            letterSpacing: "0.5px",
          }}
        >
          <span role="img" aria-label="box">📦</span> Current Inventory
        </Typography>
      </Box>
      <DataGrid
        rows={filteredItems}
        columns={columns}
        pageSize={5}
        getRowId={(row) => row.id}
        disableSelectionOnClick
        sx={{
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          boxShadow: 3,
          fontFamily: `'Segoe UI', Roboto, sans-serif`,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f4f6f8",
            color: "#333",
            fontWeight: "bold",
            textTransform: "uppercase",
            fontSize: "0.85rem",
          },
          "& .MuiDataGrid-cell": {
            fontSize: "0.92rem",
            padding: "10px",
          },
          "& .MuiDataGrid-row": {
            transition: "background 0.2s",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#fafafa",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#e3f2fd",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#f4f6f8",
          },
        }}
      />



    </Box>
  );
};

export default ItemList;
