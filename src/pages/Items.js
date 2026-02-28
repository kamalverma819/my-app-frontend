import {
  Button,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory";
import React, { useState, useEffect } from "react";
import ItemForm from "../components/items/ItemForm";
import ItemList from "../components/items/ItemList";
import api from "../api/client";

const Items = () => {
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      // eslint-disable-next-line no-undef -- api is imported from ../api/client
      const res = await api.get("/api/items");
      setItems(res.data);
    } catch (err) {
      // Error fetching items
    }
  };


  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div style={{ padding: '32px' }}>
      <div
        style={{
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '32px',
          background: "#f5f7fa",
          boxShadow: '0px 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <InventoryIcon color="primary" fontSize="large" />
            <h2 style={{ fontWeight: 'bold', margin: 0 }}>
              Inventory Items
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
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
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Items;
