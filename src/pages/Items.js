import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Paper,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import React, { useState, useEffect } from "react";
import ItemForm from "../components/items/ItemForm";
import ItemList from "../components/items/ItemList";
import axios from "axios";

const Items = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const fetchItems = () => {
  axios
    .get(`${BASE_URL}/items`)
    .then((res) => setItems(res.data))
    .catch((err) => console.error("Fetch error", err));
};


  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          borderRadius: 3,
          mb: 4,
          background: "#f5f7fa",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <InventoryIcon color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              Inventory Items
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              variant="outlined"
              label="Search Item"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingItem(null);
                setOpenForm(true);
              }}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Add Item
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {openForm && (
        <ItemForm
          item={editingItem}
          onClose={() => setOpenForm(false)}
          onSaved={() => {
            fetchItems();
            setOpenForm(false);
          }}
        />
      )}

      <ItemList
        items={items}
        searchTerm={searchTerm}
        fetchItems={fetchItems}
        onEdit={(item) => {
          setEditingItem(item);
          setOpenForm(true);
        }}
      />
    </Box>
  );
};

export default Items;
