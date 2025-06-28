import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Button, Typography, TextField, Autocomplete, Paper, Divider,
  Grid
} from '@mui/material';
import {
  Add as AddIcon, Save as SaveIcon
} from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';

const PurchaseForm = () => {
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [gstin, setGstin] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentItemName, setCurrentItemName] = useState('');
  const [currentItem, setCurrentItem] = useState({
    hsnCode: '',
    quantity: 1,
    price: 0,
    gstRate: 18
  });
  const [freight, setFreight] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorsRes, itemsRes] = await Promise.all([
          axios.get('/api/vendors'),
          axios.get('/api/items')
        ]);
        setVendors(vendorsRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  const handleVendorChange = (e, vendor) => {
    setSelectedVendor(vendor);
    setGstin(vendor?.gstin || '');
  };

  const handleAddItem = () => {
    if (!currentItemName || currentItem.quantity <= 0 || currentItem.price <= 0) return;

    const itemToAdd = {
      name: currentItemName,
      hsnCode: currentItem.hsnCode,
      quantity: currentItem.quantity,
      gstRate: 18, // Default GST rate
      price: currentItem.price
    };

    setSelectedItems(prev => [...prev, itemToAdd]);

    setCurrentItemName('');
    setCurrentItem({
      hsnCode: '',
      quantity: 1,
      price: 0,
      gstRate: 18 // Default GST rate
    });
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const getStateCode = (gstin) => gstin?.substring(0, 2);

  const calculateGST = () => {
    const companyStateCode = "23"; // MP
    const vendorStateCode = getStateCode(gstin);
    let cgst = 0, sgst = 0, igst = 0;

    selectedItems.forEach((item) => {
      const gstRate = 18;
      const amount = item.quantity * item.price;
      const gstAmount = (gstRate / 100) * amount;

      if (vendorStateCode === companyStateCode) {
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
      } else {
        igst += gstAmount;
      }
    });

    // Include GST on freight (assuming 18% GST rate)
    const freightAmount = Number(freight) || 0;
    const freightGST = (18 / 100) * freightAmount;

    if (vendorStateCode === companyStateCode) {
      cgst += freightGST / 2;
      sgst += freightGST / 2;
    } else {
      igst += freightGST;
    }

    return { cgst, sgst, igst };
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const gst = calculateGST();
    const total = subtotal + gst.cgst + gst.sgst + gst.igst + Number(freight);
    return { subtotal, gst, total };
  };

  const { subtotal, gst, total } = calculateTotals();

  const handleSubmit = async () => {
    if (!invoiceNo || !invoiceDate || !selectedVendor || selectedItems.length === 0) {
      alert('Fill all required fields');
      return;
    }

    const payload = {
      invoiceNo,
      invoiceDate,
      vendorName: selectedVendor.name,
      gstin: selectedVendor.gstin,
      items: selectedItems,
      freight: Number(freight),
      subtotal,
      total,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst
    };

    try {
      await axios.post('/api/purchases', payload);
      alert('Purchase saved successfully');
      setInvoiceNo('');
      setInvoiceDate('');
      setSelectedVendor(null);
      setGstin('');
      setSelectedItems([]);
      setFreight(0);
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Failed to save purchase');
    }
  };

return (
  <Box sx={{ backgroundColor: '#f5f7fa', p: 3, borderRadius: 2, mb: 4 }}>
    <Typography variant="h4" fontWeight="bold" gutterBottom>
      Purchase Invoice
    </Typography>

    <Paper elevation={3} sx={{ p: 4 }}>
      {/* Top Section */}
   <div className="row mb-3">
          <div className="col-md-4">
            <TextField label="Invoice Number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} fullWidth required />
          </div>
          <div className="col-md-4">
            <TextField label="Invoice Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth required />
          </div>
          <div className="col-md-4">
            <Autocomplete
              options={vendors}
              getOptionLabel={(v) => v.name}
              value={selectedVendor}
              onChange={handleVendorChange}
              renderInput={(params) => <TextField {...params} label="Select Vendor" required />}
            />
          </div>
          <div className="col-md-4 mt-3">
            <TextField label="GSTIN" value={gstin} fullWidth disabled />
          </div>
        </div>

      <Divider sx={{ my: 4 }} />

      {/* Add Items Section */}
      <Typography variant="h6" gutterBottom>
        Add Items
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Autocomplete
            freeSolo
            options={items.map(i => i.name)}
            value={currentItemName}
            onInputChange={(e, val) => {
              setCurrentItemName(val);
              const found = items.find(i => i.name.toLowerCase() === val?.toLowerCase());
              if (found) {
                setCurrentItem(prev => ({
                  ...prev,
                  hsnCode: found.hsnCode,
                  price: found.buyingPrice || prev.price
                }));
              }
            }}
            renderInput={(params) => (
              <TextField {...params} label="Item Name" fullWidth />
            )}
            sx={{ minWidth: 300 }} // Or any desired width
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            label="HSN Code"
            value={currentItem.hsnCode}
            onChange={(e) => setCurrentItem({ ...currentItem, hsnCode: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            label="Qty"
            type="number"
            value={currentItem.quantity}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            label="Price"
            type="number"
            value={currentItem.price}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) || 0 })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ height: '100%' }}
          >
            Add
          </Button>
        </Grid>
      </Grid>

      {/* Item Table */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Items</Typography>
        <div className="table-responsive">
          <table className="table table-bordered table-hover table-striped">
            <thead className="table-dark">
              <tr>
                <th>Item</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.hsnCode}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price.toFixed(2)}</td>
                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>

      {/* Summary and Save */}
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Freight Charges"
            type="number"
            value={freight}
            onChange={(e) => setFreight(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f0f4f8' }}>
            <Typography variant="subtitle1">Subtotal: ₹{subtotal.toFixed(2)}</Typography>
            <Typography variant="subtitle1">Freight: ₹{Number(freight).toFixed(2)}</Typography>
            <Typography variant="subtitle1">CGST: ₹{gst.cgst.toFixed(2)}</Typography>
            <Typography variant="subtitle1">SGST: ₹{gst.sgst.toFixed(2)}</Typography>
            <Typography variant="subtitle1">IGST: ₹{gst.igst.toFixed(2)}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" fontWeight="bold">Total: ₹{total.toFixed(2)}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} display="flex" alignItems="flex-end">
          <Button
            fullWidth
            variant="contained"
            color="success"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            sx={{ height: '56px' }}
          >
            Save Purchase
          </Button>
        </Grid>
      </Grid>
    </Paper>
  </Box>
);

};

export default PurchaseForm;
