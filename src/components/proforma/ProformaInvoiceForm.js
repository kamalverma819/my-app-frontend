// src/components/proforma/ProformaInvoiceForm.js
import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Typography, Button, Stack, IconButton, MenuItem, Dialog, DialogTitle, DialogContent, Autocomplete,
  Divider,
  Paper
} from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
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
  declaration: `We declare that this proforma invoice shows the actual price of the goods described and that all particulars are true and correct.`,
  footer: `SUBJECT TO BHOPAL JURISDICTION\nThis is a Computer Generated Proforma Invoice`,
  signatory: `For NEW LOTUS TEXTILE ELECTRONICS\nAuthorised signatory`
};

const ProformaInvoiceForm = ({ onSaved, editData = null }) => {
 const [invoiceNo, setInvoiceNo] = useState(editData?.invoiceNo || '');
const [invoiceDate, setInvoiceDate] = useState(editData?.invoiceDate || new Date().toISOString().split('T')[0]);
const [customer, setCustomer] = useState({name: editData?.customerName || '',gstin: editData?.gstin || ''});
  const [customers, setCustomers] = useState([]);
const [items, setItems] = useState(editData?.items || [{ ...initialItem }]);
  const [itemOptions, setItemOptions] = useState([]);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
const [freight, setFreight] = useState(editData?.freight || 0);


  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
axios.get(`${BASE_URL}/customers`).then(res => setCustomers(res.data));
axios.get(`${BASE_URL}/items`).then(res => {
    const fetchedItems = res.data;
    setItemOptions(fetchedItems);

    // If editing, enrich each item with stock and other properties
    if (editData?.items) {
      const enrichedItems = editData.items.map(editedItem => {
        const matched = fetchedItems.find(i => i.name === editedItem.name);
        return {
          ...editedItem,
          itemId: matched?.id || editedItem.itemId || '',
          hsnCode: matched?.hsnCode || editedItem.hsnCode || '',
          price: editedItem.price,
          discount: editedItem.discount || matched?.discount || 0,
          gstRate: editedItem.gstRate || matched?.gstRate || 18,
          originalQuantity: matched?.stock ?? 0, // ✅ important line
        };
      });
      setItems(enrichedItems);
    }
  });
  axios.get(`${BASE_URL}/proforma-invoices`).then(res => {
  const count = res.data.length + 1;
  const num = count.toString().padStart(3, '0');
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
    // Ensure n is a number and finite
    if (typeof n !== 'number' || !isFinite(n)) return '';
    if (n === 0) return 'Zero';

    if (n < 20) return ones[n];
    if (n < 100) {
      return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    }
    if (n < 1000) {
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
    }
    if (n < 100000) {
      return numToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
    }
    if (n < 10000000) {
      return numToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
    }
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
      if (selectedItem) {
        // Existing item selected from dropdown
        updated[idx] = {
          ...updated[idx],
          itemId: selectedItem.id || '',
          name: selectedItem.name || value,
          hsnCode: selectedItem.hsnCode || '',
          price: selectedItem.sellingPrice || 0,
          discount: selectedItem.discount || 0,
          gstRate: 18, // Default GST rate
          stock: selectedItem.stock || 0
        };
      } else {
        // New item typed or edited - allow custom name
        updated[idx] = {
          ...updated[idx],
          itemId: '', // No itemId for new/custom items
          name: value || '',
          // Keep existing hsnCode, price, discount, gstRate if already set
          hsnCode: updated[idx].hsnCode || '',
          price: updated[idx].price || 0,
          discount: updated[idx].discount || 0,
          gstRate: updated[idx].gstRate || 18,
          stock: 0 // No stock for custom items
        };
      }
    } else if (key === 'quantity') {
      const quantity = parseInt(value) || 0;
      const availableStock = updated[idx].stock;
      // Only check stock if it's an existing item (has stock > 0)
      if (availableStock > 0 && quantity > availableStock) {
        alert(`Quantity exceeds available stock (${availableStock})`);
        return;
      }
      updated[idx].quantity = quantity;
    } else if (key === 'hsnCode') {
      // Allow editing HSN code
      updated[idx].hsnCode = value || '';
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
      status: editData?.status || "under-process"
    };

    if (editData && editData.id) {
      await axios.put(`${BASE_URL}/proforma-invoices/${editData.id}`, payload);
    } else {
      await axios.post(`${BASE_URL}/proforma-invoices`, payload);
    }

    alert('Saved successfully');
    onSaved();
  } catch (err) {
    console.error('Save error:', err);
    alert('Failed to save proforma invoice');
  }
};

const handleDownloadPDF = () => {
  if (!invoiceNo || items.length === 0) {
    alert("Proforma invoice content is empty or not rendered yet.");
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper function to add text with word wrap
  const addText = (text, x, y, maxWidth, fontSize = 10, align = 'left', fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return y + (lines.length * fontSize * 0.4);
  };

  // Title - PROFORMA INVOICE
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PROFORMA INVOICE', pageWidth / 2, yPos, { align: 'left' });
  yPos += 8;

  // Company Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(COMPANY_INFO.address, pageWidth - 2 * margin);
  doc.text(addressLines, pageWidth / 2, yPos, { align: 'center' });
  yPos += addressLines.length * 5 + 3;

  doc.setFontSize(9);
  doc.text(`GSTIN: ${COMPANY_INFO.gstin} | Contact: ${COMPANY_INFO.contact} | Email: ${COMPANY_INFO.email}`, 
    pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  // Invoice Details Section
  const leftColX = margin;
  const rightColX = pageWidth - margin;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`PI No.:  ${invoiceNo}`, leftColX, yPos);
  yPos += 5;
  doc.text(`Date: ${formatDate(invoiceDate)}`, leftColX, yPos);
  
  // Bill To Section
  const billToY = yPos - 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To: ', rightColX, billToY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name || '—', rightColX, billToY + 5, { align: 'right' });
  doc.text(`GSTIN: ${customer.gstin || '—'}`, rightColX, billToY + 10, { align: 'right' });
  
  yPos += 10;

  // Items Table
  const tableData = items.map(i => {
    const discountedPrice = i.price * (1 - i.discount / 100);
    const total = i.quantity * discountedPrice;
    return [
      i.name || '—',
      i.hsnCode || '—',
      i.quantity.toString(),
      i.price.toFixed(2),
      i.discount.toString() + '%',
      total.toFixed(2)
    ];
  });

  // Calculate available width for table
  const availableWidth = pageWidth - 2 * margin;
  
  // Use autoTable function (v5 syntax) with improved formatting
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'HSN', 'Qty', 'Price', 'Disc %', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [240, 240, 240], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { 
        cellWidth: availableWidth * 0.35, // Description - 35% width
        halign: 'left'
      },
      1: { 
        cellWidth: availableWidth * 0.15, // HSN - 15% width
        halign: 'center'
      },
      2: { 
        cellWidth: availableWidth * 0.10, // Qty - 10% width
        halign: 'center'
      },
      3: { 
        cellWidth: availableWidth * 0.15, // Price - 15% width
        halign: 'center'
      },
      4: { 
        cellWidth: availableWidth * 0.10, // Disc % - 10% width
        halign: 'center'
      },
      5: { 
        cellWidth: availableWidth * 0.15, // Total - 15% width
        halign: 'center'
      }
    },
    margin: { left: margin, right: margin },
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    }
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Totals Section - Right aligned
  // Ensure summary section stays together on one page
  const summaryHeight = 85; // Space for all summary items (Subtotal, Freight, CGST, SGST, IGST, Grand Total, Amount in Words)
  const availableSpace = pageHeight - yPos - margin;
  
  // If summary won't fit on current page, move to next page
  if (summaryHeight > availableSpace) {
    doc.addPage();
    yPos = margin;
  }

  const subtotal = calculateSubtotal();
  const gstValues = calculateGST();
  const total = calculateTotal();
  const totalsX = pageWidth - margin - 80; // Label position
  const totalsValueX = pageWidth - margin; // Value position

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Ensure values are properly calculated and formatted
  const subtotalValue = parseFloat(subtotal.toFixed(2));
  const freightValue = parseFloat((Number(freight) || 0).toFixed(2));
  const cgstValue = parseFloat(gstValues.cgst.toFixed(2));
  const sgstValue = parseFloat(gstValues.sgst.toFixed(2));
  const igstValue = parseFloat(gstValues.igst.toFixed(2));
  const totalValue = parseFloat(total.toFixed(2));
  
  // Subtotal
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(`${subtotalValue.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
  yPos += 6;

  // Freight
  doc.text('Freight:', totalsX, yPos);
  doc.text(`${freightValue.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
  yPos += 6;

  // CGST
  if (cgstValue > 0) {
    doc.text('CGST:', totalsX, yPos);
    doc.text(`${cgstValue.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
    yPos += 6;
  }

  // SGST
  if (sgstValue > 0) {
    doc.text('SGST:', totalsX, yPos);
    doc.text(`${sgstValue.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
    yPos += 6;
  }

  // IGST
  if (igstValue > 0) {
    doc.text('IGST:', totalsX, yPos);
    doc.text(`${igstValue.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
    yPos += 6;
  }

  // Grand Total - Bold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Grand Total:', totalsX, yPos);
  doc.text(`${totalValue.toFixed(2)}`, totalsValueX, yPos, { align: 'right' });
  yPos += 8;

  // Amount in Words
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const amountInWords = convertNumberToWords(total);
  const wordsText = `Amount in Words: ${amountInWords}`;
  const wordsLines = doc.splitTextToSize(wordsText, pageWidth - 2 * margin);
  doc.text(wordsLines, margin, yPos);
  yPos += wordsLines.length * 5 + 8;

  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin;
  }

  // Bank Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Company's Bank Details:", margin, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Bank Name: ${COMPANY_INFO.bank.name}`, margin, yPos);
  yPos += 5;
  doc.text(`Branch Name: ${COMPANY_INFO.bank.branch}`, margin, yPos);
  yPos += 5;
  doc.text(`Current A/C No.: ${COMPANY_INFO.bank.account}`, margin, yPos);
  yPos += 5;
  doc.text(`IFSC Code: ${COMPANY_INFO.bank.ifsc}`, margin, yPos);
  yPos += 5;
  doc.text(`Branch Code: ${COMPANY_INFO.bank.branchCode}`, margin, yPos);
  yPos += 8;

  // Declaration
  doc.setFontSize(9);
  const declarationLines = doc.splitTextToSize(COMPANY_INFO.declaration, pageWidth - 2 * margin);
  doc.text(declarationLines, margin, yPos);
  yPos += declarationLines.length * 5 + 10;

  // Signature
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${COMPANY_INFO.name}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Authorised signatory', pageWidth - margin, yPos, { align: 'right' });
  
  // Footer - Always at bottom of the last page
  // Check if we need a new page for footer
  const footerLines = COMPANY_INFO.footer.split('\n');
  const footerHeight = footerLines.length * 4 + 5;
  
  if (yPos + footerHeight > pageHeight - margin) {
    doc.addPage();
  }
  
  // Position footer at bottom of current page
  const footerY = pageHeight - margin - footerHeight;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  footerLines.forEach((line, index) => {
    doc.text(line, pageWidth / 2, footerY + (index * 4), { align: 'center' });
  });

  // Save PDF
  doc.save(`${invoiceNo}.pdf`);
  setShowDownloadOptions(false);
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
  wsData.push(['PI No.:', invoiceNo, '', 'Date:', invoiceDate]);
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
  XLSX.utils.book_append_sheet(wb, ws, 'Proforma Invoice');
  XLSX.writeFile(wb, `${invoiceNo}.xlsx`);
  setShowDownloadOptions(false);
};


  return (
    <Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, backgroundColor: '#f9fafc' }}>
        {/* Header */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Generate Proforma Invoice
        </Typography>

        {/* Invoice & Customer Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="PI No."
              fullWidth
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="PI Date"
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
              freeSolo
              options={getAvailableItemOptions(idx).map(i => i.name)}
              value={item.name || ''}
              onChange={(e, value) => {
                // Handle both selection from dropdown and typing new value
                handleItemChange(idx, 'name', value || '');
              }}
              onInputChange={(e, newInputValue, reason) => {
                // Handle typing - update immediately when user types
                if (reason === 'input') {
                  handleItemChange(idx, 'name', newInputValue || '');
                }
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Item" 
                  fullWidth 
                  placeholder="Select from list or type to add new item"
                />
              )}
              sx={{ flex: 2 }}
            />
            <TextField 
              label="HSN" 
              type="text"
              value={item.hsnCode}
              onChange={e => handleItemChange(idx, 'hsnCode', e.target.value)}
              fullWidth  
              sx={{ flex: 1 }} 
            />
            <TextField
              label={`Qty (Stock: ${
                (Number(item.stock) || 0) + (Number(item.originalQuantity) || 0)
              })`}
              type="text"
              value={item.quantity}
              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
              fullWidth
              sx={{ flex: 1 }}
            />
            <TextField
              label="Price"
              type="text"
              value={item.price}
              onChange={e => handleItemChange(idx, 'price', e.target.value)}
              fullWidth
              sx={{ flex: 1 }}
            />
            <TextField
              label="Discount (%)"
              type="text"
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
          type="text"
          value={freight || ''}
          onChange={(e) => {
            const value = e.target.value;
            setFreight(value === '' ? 0 : parseFloat(value) || 0);
          }}
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
            <Typography><strong>PI No.:</strong> {invoiceNo}</Typography>
            <Typography><strong>Date:</strong> {formatDate(invoiceDate)}</Typography>
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
            <Stack direction="row" justifyContent="space-between"><Typography>Freight:</Typography><Typography>₹{(Number(freight) || 0).toFixed(2)}</Typography></Stack>

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

export default ProformaInvoiceForm;
