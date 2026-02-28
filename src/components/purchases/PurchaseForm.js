import React, { useState, useEffect } from 'react';
import api from "../../api/client";
import {
  Button, TextField, Autocomplete,
  Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Add as AddIcon, Save as SaveIcon
} from '@mui/icons-material';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchData = async () => {
      try {
const [vendorsRes, itemsRes] = await Promise.all([
  api.get("/api/vendors"),
  api.get("/api/items")
]);
        setVendors(vendorsRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch data', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Fill all required fields', severity: 'warning' });
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
      await api.post("/api/purchases", payload);
      setSnackbar({ open: true, message: 'Purchase saved successfully', severity: 'success' });
      setInvoiceNo('');
      setInvoiceDate('');
      setSelectedVendor(null);
      setGstin('');
      setSelectedItems([]);
      setFreight(0);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to save purchase', severity: 'error' });
    }
  };

return (
  <div style={{ backgroundColor: '#f5f7fa', padding: '24px', borderRadius: '8px', marginBottom: '32px' }}>
    <h1 style={{ fontWeight: 'bold', marginBottom: '16px' }}>
      Purchase Invoice
    </h1>

    <div style={{ padding: '32px', boxShadow: '0px 2px 8px rgba(0,0,0,0.1)', borderRadius: '4px' }}>
      {/* Top Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div style={{ gridColumn: 'span 12 / span 4' }}>
          <TextField label="Invoice Number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} fullWidth required />
        </div>
        <div style={{ gridColumn: 'span 12 / span 4' }}>
          <TextField label="Invoice Date" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth required />
        </div>
        <div style={{ gridColumn: 'span 12 / span 4' }}>
          <Autocomplete
            options={vendors}
            getOptionLabel={(v) => v.name}
            value={selectedVendor}
            onChange={handleVendorChange}
            renderInput={(params) => <TextField {...params} label="Select Vendor" required />}
          />
        </div>
        <div style={{ gridColumn: 'span 12 / span 4' }}>
          <TextField label="GSTIN" value={gstin} fullWidth disabled />
        </div>
      </div>

      <hr style={{ margin: '32px 0' }} />

      {/* Add Items Section */}
      <h2 style={{ marginBottom: '16px' }}>
        Add Items
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', alignItems: 'center' }}>
        <div style={{ gridColumn: 'span 12 / span 4' }}>
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
            sx={{ minWidth: 300 }}
          />
        </div>
        <div style={{ gridColumn: 'span 6 / span 2' }}>
          <TextField
            label="HSN Code"
            value={currentItem.hsnCode}
            onChange={(e) => setCurrentItem({ ...currentItem, hsnCode: e.target.value })}
            fullWidth
          />
        </div>
        <div style={{ gridColumn: 'span 6 / span 2' }}>
          <TextField
            label="Qty"
            type="number"
            value={currentItem.quantity}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value)})
            }
            fullWidth
            sx={{
              '& input[type=number]': {
                MozAppearance: 'textfield'
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              }
            }}
          />
        </div>
        <div style={{ gridColumn: 'span 6 / span 2' }}>
          <TextField
            label="Price"
            type="number"
            value={currentItem.price}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })
            }
            fullWidth
            sx={{
              '& input[type=number]': {
                MozAppearance: 'textfield'
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              }
            }}
          />
        </div>
        <div style={{ gridColumn: 'span 6 / span 2' }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ height: '100%' }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Item Table */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Items</h2>
        <TableContainer variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#212121' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>HSN</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Qty</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.hsnCode}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Summary and Save */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginTop: '24px' }}>
        <div style={{ gridColumn: 'span 12 / span 4' }}>
          <TextField
            label="Freight Charges"
            type="number"
            value={freight || ''}
            onChange={(e) => {
              const value = e.target.value;
              setFreight(value === '' ? 0 : parseFloat(value) || 0);
            }}
            fullWidth
            sx={{
              '& input[type=number]': {
                MozAppearance: 'textfield'
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              }
            }}
          />
        </div>

        <div style={{ gridColumn: 'span 12 / span 4', padding: '16px', border: '1px solid #e0e0e0', backgroundColor: '#f0f4f8', borderRadius: '4px' }}>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>Freight: ₹{Number(freight).toFixed(2)}</p>
          <p>CGST: ₹{gst.cgst.toFixed(2)}</p>
          <p>SGST: ₹{gst.sgst.toFixed(2)}</p>
          <p>IGST: ₹{gst.igst.toFixed(2)}</p>
          <hr style={{ margin: '8px 0' }} />
          <h3 style={{ fontWeight: 'bold' }}>Total: ₹{total.toFixed(2)}</h3>
        </div>

        <div style={{ gridColumn: 'span 12 / span 4', display: 'flex', alignItems: 'flex-end' }}>
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
        </div>
      </div>
    </div>

    {/* Snackbar for notifications */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
  </div>
);

};

export default PurchaseForm;
