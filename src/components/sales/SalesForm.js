// src/components/sales/SalesForm.js
import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, Button, Stack, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, Autocomplete,
  Divider,
  Paper
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { Grid } from '@mui/material';


const initialItem = { name: '', hsnCode: '', quantity: 1, price: 0, gstRate: 18, stock: 0, discount: 0 };

const COMPANY_INFO = {
  name: "NEW LOTUS TEXTILE ELECTRONICS",
  contact: "7999932108",
  email: "newlotuselectronics1012@gmail.com",
  gstin: "23CAWPV8800M1ZT",
  address: `H No -S-4, Nishan Tower, Durgesh Vihar Colony, Near Gate no. 1, Minal J.K. Road Bhopal (M.P.) - 462023`,
  bank: {
    name: "Kotak Mahindra Bank",
    branch: "Indrapuri, Bhopal (M.P.)",
    account: "6746178225",
    ifsc: "KKBK0005892",
    branchCode: "5892"
  },
  declaration: `We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.`,
  footer: `SUBJECT TO BHOPAL JURISDICTION\nThis is a Computer Generated Invoice`,
  signatory: `For NEW LOTUS TEXTILE ELECTRONICS\nAuthorised signatory`
};

const SalesForm = ({ onSaved }) => {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [customer, setCustomer] = useState({ name: '', gstin: '' });
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([{ ...initialItem }]);
  const [itemOptions, setItemOptions] = useState([]);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [freight, setFreight] = useState(0);
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    axios.get('/api/customers').then(res => setCustomers(res.data));
    axios.get('/api/items').then(res => setItemOptions(res.data));
    axios.get('/api/sales').then(res => {
      const count = res.data.length + 1;
      const num = count.toString().padStart(3, '0');
      setInvoiceNo(`NLTE/2024-25/${num}`);
    });
  }, []);

  function convertNumberToWords(amount) {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function numToWords(n) {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    }

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = 'Rupees ';
    result += rupees === 0 ? 'Zero' : numToWords(rupees);
    if (paise > 0) {
      result += ' and ' + numToWords(paise) + ' Paise';
    }
    result += ' Only';
    return result;
  }

  const getAvailableItemOptions = (currentIdx) => {
    const selectedNames = items
      .filter((_, idx) => idx !== currentIdx)
      .map(i => i.name);
    return itemOptions.filter(i => !selectedNames.includes(i.name));
  };

  const handleCustomerChange = (event, value) => {
    const selected = customers.find(c => c.name === value);
    setCustomer(selected ? { name: selected.name, gstin: selected.gstin } : { name: value, gstin: '' });
  };


  const handleItemChange = (idx, key, value) => {
    const updated = [...items];

    if (key === 'name') {
      const selectedItem = itemOptions.find(i => i.name === value);
      updated[idx] = {
        ...updated[idx],
        itemId: selectedItem?.id || '',   // ✅ Add this line
        name: selectedItem?.name || value,
        hsnCode: selectedItem?.hsnCode || '',
        price: selectedItem?.sellingPrice || 0,
        // gstRate: selectedItem?.gstRate || 0,
        gstRate: 18, // Default GST rate
        stock: selectedItem?.stock || 0
      };
    } else if (key === 'quantity') {
      const quantity = parseInt(value) || 0;
      const availableStock = updated[idx].stock;
      if (quantity > availableStock) {
        alert(`Quantity exceeds available stock (${availableStock})`);
        return;
      }
      updated[idx].quantity = quantity;
    } else if (['price', 'gstRate', 'discount'].includes(key)) {
      updated[idx][key] = parseFloat(value) || 0;
    }

    setItems(updated);
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  };


  const handleAddItem = () => setItems([...items, { ...initialItem }]);
  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const calculateSubtotal = () => items.reduce((sum, i) => {
    const discountedPrice = i.price * (1 - i.discount / 100);
    return sum + i.quantity * discountedPrice;
  }, 0);

  const getStateCode = (gstin) => gstin?.substring(0, 2);

  const calculateGST = () => {
    const companyStateCode = "23"; // Madhya Pradesh
    const customerStateCode = getStateCode(customer.gstin);

    let cgst = 0, sgst = 0, igst = 0;

    // GST on each item
    items.forEach((i) => {
      const discountedPrice = i.price * (1 - i.discount / 100);
      const taxableAmount = i.quantity * discountedPrice;
      const gstAmount = (i.gstRate / 100) * taxableAmount;

      if (customerStateCode === companyStateCode) {
        cgst += gstAmount / 2;
        sgst += gstAmount / 2;
      } else {
        igst += gstAmount;
      }
    });

    // GST on freight (fixed 18% as per purchase logic)
    const freightAmount = Number(freight) || 0;
    const freightGST = (18 / 100) * freightAmount;

    if (customerStateCode === companyStateCode) {
      cgst += freightGST / 2;
      sgst += freightGST / 2;
    } else {
      igst += freightGST;
    }

    return { cgst, sgst, igst };
  };

  const calculateTotal = () => {
    const gst = calculateGST();
    return calculateSubtotal() + gst.cgst + gst.sgst + gst.igst + Number(freight || 0);
  };

  const gst = calculateGST();


  const handleSave = async () => {
    try {
      const gstValues = calculateGST();
      const payload = {
        invoiceNo,
        invoiceDate,
        customerName: customer.name,
        gstin: customer.gstin,
        items,
        subtotal: calculateSubtotal(),
        cgst: gstValues.cgst,
        sgst: gstValues.sgst,
        igst: gstValues.igst,
        freight,
        total: calculateTotal(),
        poNo,
        poDate,
        status: "under-process"
      };
      await axios.post('/api/sales', payload);
      alert('Saved successfully');
      onSaved();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save invoice');
    }
  };

const handleDownloadPDF = () => {
  const element = document.getElementById('invoice-preview');
  if (!element || element.innerText.trim() === '') {
    alert("Invoice content is empty or not rendered yet.");
    return;
  }

  // Optional: temporarily scale down the content to fit on one A4 page
  element.style.transform = "scale(0.85)";
  element.style.transformOrigin = "top center";

  const opt = {
    margin: 0,
    filename: `${invoiceNo}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 1,   // Lower scale = smaller size = zoomed out
      useCORS: true,
    },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  setTimeout(() => {
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore after download
      element.style.transform = "scale(1)";
      element.style.transformOrigin = "unset";
      setShowDownloadOptions(false);
    });
  }, 300);
};

function amountInWords(amount) {
  // You likely already have this logic.
  // If not, I can provide a full rupee+paise converter
  return "Rupees One Thousand Two Hundred Thirty Only"; // example
}




 const handleDownloadExcel = () => {
  const wsData = [];

  // Company Info
  wsData.push([COMPANY_INFO.name]);
  wsData.push([COMPANY_INFO.address]);
  wsData.push([]);
  
  // Invoice Info
  wsData.push(['Invoice No:', invoiceNo, '', 'Date:', invoiceDate]);
  wsData.push(['Customer:', customer.name, '', 'GSTIN:', customer.gstin || '']);
  wsData.push([]);

  // Table Header
  wsData.push(['Description', 'HSN', 'Qty', 'Price', 'Disc%', 'GST%', 'Total']);

  // Table Rows
  items.forEach(i => {
    const discounted = i.price * (1 - i.discount / 100);
    const total = i.quantity * discounted * (1 + i.gstRate / 100);
    wsData.push([
      i.name,
      i.hsnCode,
      i.quantity,
      i.price,
      i.discount,
      i.gstRate,
      total.toFixed(2)
    ]);
  });

  wsData.push([]);

  // Calculations
  const subtotal = items.reduce(
    (sum, i) => sum + i.quantity * i.price * (1 - i.discount / 100),
    0
  );
  const totalGst = items.reduce(
    (sum, i) => sum + i.quantity * i.price * (1 - i.discount / 100) * (i.gstRate / 100),
    0
  );
  const freightAmount = Number(freight) || 0;
  const grandTotal = subtotal + totalGst + freightAmount;

  wsData.push(['Freight', '', '', '', '', '', freightAmount.toFixed(2)]);
  wsData.push(['Subtotal', '', '', '', '', '', subtotal.toFixed(2)]);
  wsData.push(['Total GST', '', '', '', '', '', totalGst.toFixed(2)]);
  wsData.push(['Grand Total', '', '', '', '', '', grandTotal.toFixed(2)]);
  wsData.push(['Amount in Words:', amountInWords(grandTotal)]);

  // Sheet creation
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Optional: Auto column width
  const colWidths = wsData[0].map((_, colIndex) => ({
    wch: Math.max(...wsData.map(row => (row[colIndex]?.toString().length || 10)))
  }));
  ws['!cols'] = colWidths;

  // Export
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
  XLSX.writeFile(wb, `${invoiceNo}.xlsx`);
  setShowDownloadOptions(false);
};


  return (
    <Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, backgroundColor: '#f9fafc' }}>
        {/* Header */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Generate Invoice
        </Typography>

        {/* Invoice & Customer Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Invoice No"
              fullWidth
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Invoice Date"
              type="date"
              fullWidth
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={customers.map(c => c.name)}
              value={customer.name}
              onChange={handleCustomerChange}
              renderInput={(params) => (
                <TextField {...params} label="Customer Name" fullWidth />
              )}
              sx={{
                width: 300,
                '.MuiAutocomplete-input': {
                  whiteSpace: 'normal',
                  overflow: 'visible',
                  textOverflow: 'unset',
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField label="GSTIN" fullWidth value={customer.gstin} disabled />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Buyers P.O. No."
              fullWidth
              value={poNo}
              onChange={(e) => setPoNo(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="P.O. Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
            />
          </Grid>
        </Grid>

        {/* Items */}
        <Typography variant="subtitle1" fontWeight="bold" mt={4} mb={1}>
          Items
        </Typography>

        {items.map((item, idx) => (
          <Stack
            key={idx}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Autocomplete
              options={getAvailableItemOptions(idx).map(i => i.name)}
              value={item.name}
              onChange={(e, value) => handleItemChange(idx, 'name', value)}
              renderInput={(params) => (
                <TextField {...params} label="Item" fullWidth />
              )}
              sx={{ flex: 2 }}
            />
            <TextField label="HSN" value={item.hsnCode} fullWidth disabled sx={{ flex: 1 }} />
            <TextField
              label={`Qty (Stock: ${item.stock})`}
              type="number"
              value={item.quantity}
              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
              fullWidth
              sx={{ flex: 1 }}
            />
            <TextField
              label="Price"
              type="number"
              value={item.price}
              onChange={e => handleItemChange(idx, 'price', e.target.value)}
              fullWidth
              sx={{ flex: 1 }}
            />
            <TextField
              label="Discount (%)"
              type="number"
              value={item.discount}
              onChange={e => handleItemChange(idx, 'discount', e.target.value)}
              fullWidth
              sx={{ flex: 1 }}
            />
            <IconButton onClick={() => handleRemoveItem(idx)} color="error">
              <RemoveCircle />
            </IconButton>
          </Stack>
        ))}

        {/* Add Item Button */}
        <Button
          startIcon={<AddCircle />}
          onClick={handleAddItem}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add Item
        </Button>

        {/* Freight */}
        <TextField
          label="Freight"
          type="number"
          value={freight}
          onChange={(e) => setFreight(parseFloat(e.target.value))}
          fullWidth
          sx={{ mt: 3 }}
        />

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mt={4}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="outlined" onClick={() => setShowDownloadOptions(true)}>
            Download
          </Button>
        </Stack>
      </Paper>

      {/* Preview Section */}
      <Box id="invoice-preview" sx={{ mt: 4, px: 4, py: 3, backgroundColor: 'transparent', fontFamily: 'Poppins, sans-serif' }}>
        <Typography variant="h5" align="center" fontWeight="bold" color="primary">{COMPANY_INFO.name}</Typography>
        <Typography align="center">{COMPANY_INFO.address}</Typography>
        <Typography align="center" mb={2}>GSTIN: {COMPANY_INFO.gstin} | Contact: {COMPANY_INFO.contact} | Email: {COMPANY_INFO.email}</Typography>

        <Stack direction="row" justifyContent="space-between" spacing={2} mb={2}>
          <Box>
            <Typography><strong>Invoice No:</strong> {invoiceNo}</Typography>
            <Typography><strong>Date:</strong> {formatDate(invoiceDate)}</Typography>
            <Typography><strong>Buyers P.O. No.:</strong> {poNo || '—'}</Typography>
            <Typography><strong>P.O. Date:</strong> {formatDate(poDate) || '—'}</Typography>
          </Box>

          <Box textAlign="right">
            <Typography fontWeight="bold">Bill To:</Typography>
            <Typography>{customer.name || '—'}</Typography>
            <Typography>GSTIN: {customer.gstin || '—'}</Typography>
          </Box>
        </Stack>

        {/* Item Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }} border="1">
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              <th style={{ padding: 8 }}>Description</th>
              <th style={{ padding: 8 }}>HSN</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Qty</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Price</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Disc%</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={idx}>
                <td style={{ padding: 8 }}>{i.name}</td>
                <td style={{ padding: 8 }}>{i.hsnCode}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{i.quantity}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>₹{i.price.toFixed(2)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{i.discount}%</td>
                <td style={{ padding: 8, textAlign: 'right' }}>
                  ₹{(i.quantity * i.price * (1 - i.discount / 100)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Box width="300px">
            <Stack direction="row" justifyContent="space-between"><Typography>Subtotal:</Typography><Typography>₹{calculateSubtotal().toFixed(2)}</Typography></Stack>
            <Stack direction="row" justifyContent="space-between"><Typography>Freight:</Typography><Typography>₹{freight.toFixed(2)}</Typography></Stack>

            <Stack direction="row" justifyContent="space-between"><Typography>CGST:</Typography><Typography>₹{gst.cgst.toFixed(2)}</Typography></Stack>
            <Stack direction="row" justifyContent="space-between"><Typography>SGST:</Typography><Typography>₹{gst.sgst.toFixed(2)}</Typography></Stack>
            <Stack direction="row" justifyContent="space-between"><Typography>IGST:</Typography><Typography>₹{gst.igst.toFixed(2)}</Typography></Stack>
            <hr />
            <Stack direction="row" justifyContent="space-between" fontWeight="bold">
              <Typography>Grand Total:</Typography>
              <Typography>₹{calculateTotal().toFixed(2)}</Typography>
            </Stack>
          </Box>
        </Box>

        <Typography mt={2} fontWeight="bold">
          Amount in Words: <span style={{ fontWeight: 'normal' }}>{convertNumberToWords(calculateTotal())}</span>
        </Typography>

        {/* Bank Info */}
        <Box mt={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Company's Bank Details:</Typography>
          <Typography>Bank Name: {COMPANY_INFO.bank.name}</Typography>
          <Typography>Branch Name: {COMPANY_INFO.bank.branch}</Typography>
          <Typography>Current A/C No.: {COMPANY_INFO.bank.account}</Typography>
          <Typography>IFSC Code: {COMPANY_INFO.bank.ifsc}</Typography>
          <Typography>Branch Code: {COMPANY_INFO.bank.branchCode}</Typography>
        </Box>

        {/* Declaration */}
        <Box mt={3}>
          <Typography>{COMPANY_INFO.declaration}</Typography>
        </Box>

        {/* Signature */}
        <Box mt={4} textAlign="right">
          <Typography fontWeight="bold">For {COMPANY_INFO.name}</Typography>
          <Typography>Authorised signatory</Typography>
        </Box>

        {/* Centered Footer */}
        <Box mt={5} textAlign="center">
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'gray' }}>
            {COMPANY_INFO.footer}
          </Typography>
        </Box>

      </Box>

      {/* Download Options Dialog */}
      <Dialog open={showDownloadOptions} onClose={() => setShowDownloadOptions(false)}>
        <DialogTitle>Select Export Format</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <Button variant="contained" onClick={handleDownloadPDF}>Download PDF</Button>
            <Button variant="outlined" onClick={handleDownloadExcel}>Download Excel</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SalesForm;
