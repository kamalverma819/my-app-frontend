import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack
} from "@mui/material";
import axios from "axios";

const ItemForm = ({ item, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    hsnCode: "",
    buyingPrice: "",
    sellingPrice: "",
    gstRate: "",
    stock: "",
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (item) {
  await axios.put(`${BASE_URL}/items/${item.id}`, formData);
} else {
  await axios.post(`${BASE_URL}/items`, formData);
}
      onSaved();
    } catch (err) {
      console.error("Save failed", err);
      alert(err.response?.data || "Failed to save item");
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField name="name" label="Item Name" value={formData.name} onChange={handleChange} fullWidth />
          <TextField name="hsnCode" label="HSN Code" value={formData.hsnCode} onChange={handleChange} fullWidth />
          <TextField name="buyingPrice" label="Buying Price" type="number" value={formData.buyingPrice} onChange={handleChange} fullWidth />
          <TextField name="sellingPrice" label="Selling Price" type="number" value={formData.sellingPrice} onChange={handleChange} fullWidth />
          <TextField name="gstRate" label="GST %" type="number" value={formData.gstRate} onChange={handleChange} fullWidth />
          <TextField name="stock" label="Stock" type="number" value={formData.stock} onChange={handleChange} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">{item ? "Update" : "Save"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemForm;
