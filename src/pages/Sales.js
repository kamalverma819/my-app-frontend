import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent,
  IconButton, TextField, Select, MenuItem
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import SalesForm from '../components/sales/SalesForm';
import 'bootstrap/dist/css/bootstrap.min.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloadAll, setDownloadAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewFreight, setViewFreight] = useState(0);

  const fetchSales = async () => {
    try {
      const res = await axios.get('/api/sales');
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleViewItems = (items, freight) => {
    setSelectedItems(items);
    setViewFreight(freight);
    setOpenDialog(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/sales/${id}/status`, { status: newStatus });
      setSales((prevSales) =>
        prevSales.map(s => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const handleDownloadReport = () => {
    setShowDownloadDialog(true);
  };

  const filteredSales = sales
    .filter(s =>
      s.invoiceNo?.toLowerCase().includes(searchText.toLowerCase()) &&
      (statusFilter === 'all' || s.status === statusFilter)
    )
    .sort((a, b) => {
      const dateA = new Date(a.invoiceDate);
      const dateB = new Date(b.invoiceDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });


  return (
  <Box sx={{ p: 3 }}>
    {/* Header */}
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
      Sales Management
    </Typography>

    {/* Action Buttons */}
    <Stack direction="row" spacing={2} mb={3}>
      <Button
        variant={showForm ? 'outlined' : 'contained'}
        color="primary"
        onClick={() => setShowForm(prev => !prev)}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          px: 2.5,
        }}
      >
        {showForm ? 'Hide Form' : 'Generate New Invoice'}
      </Button>

      <Button
        variant="outlined"
        onClick={handleDownloadReport}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          px: 2.5,
        }}
      >
        Download Report
      </Button>
    </Stack>

    {/* Filter Bar */}
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      mb={3}
      alignItems="center"
      justifyContent="space-between"
    >
      <TextField
        label="Search Invoice No"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="small"
        sx={{ width: '250px' }}
      />
      <Button
        variant="outlined"
        onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        size="small"
        sx={{
          textTransform: 'none',
          fontWeight: 500,
        }}
      >
        Sort Date: {sortOrder === 'asc' ? 'Old → New' : 'New → Old'}
      </Button>
      <TextField
        select
        label="Filter Status"
        size="small"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        sx={{ width: '200px' }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="under-process">Under Process</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
        <MenuItem value="payment-received">Payment Received</MenuItem>
      </TextField>
    </Stack>

    {/* Invoice Form */}
    {showForm && (
      <Box mb={4}>
        <SalesForm onSaved={() => {
          setShowForm(false);
          fetchSales();
        }} />
      </Box>
    )}

    {/* Sales Table */}
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        All Sales
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <table className="table table-hover table-striped table-bordered mt-3">
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr className="text-center">
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>GSTIN</th>
              <th>Item Count</th>
              <th>Freight</th>
              <th>Total</th>
              <th>Items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-muted">
                  No sales found.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale, idx) => {
                const freightAmount = Number(sale.freight || 0);
                const itemSubtotal = sale.items.reduce((sum, i) =>
                  sum + (i.quantity * i.price) + ((i.quantity * i.price * i.gstRate) / 100), 0);
                const freightGst = (18 / 100) * freightAmount;
                const total = itemSubtotal + freightAmount + freightGst;

                return (
                  <tr key={idx}>
                    <td>{sale.invoiceNo}</td>
                    <td>{sale.invoiceDate}</td>
                    <td>{sale.customerName}</td>
                    <td>{sale.gstin}</td>
                    <td>{sale.items.length}</td>
                    <td>₹{freightAmount.toFixed(2)}</td>
                    <td>₹{total.toFixed(2)}</td>
                    <td className="text-center">
                      <IconButton onClick={() => handleViewItems(sale.items, sale.freight)}>
                        <VisibilityIcon />
                      </IconButton>
                    </td>
                    <td>
                      <Box
                        sx={{
                          backgroundColor:
                            sale.status === 'under-process' ? '#fff3cd' :
                              sale.status === 'completed' ? '#e1f5fe' :
                                sale.status === 'payment-received' ? '#e8f5e9' : 'white',
                          borderRadius: 1,
                          px: 1,
                        }}
                      >
                        <Select
                          size="small"
                          value={sale.status || 'under-process'}
                          onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                          variant="standard"
                          fullWidth
                        >
                          <MenuItem value="under-process">Under Process</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="payment-received">Payment Received</MenuItem>
                        </Select>
                      </Box>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
    </Paper>

    {/* Other dialogs remain unchanged */}


      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Items in Sale</DialogTitle>
        <DialogContent dividers>
          {selectedItems.length === 0 ? (
            <Typography>No items available</Typography>
          ) : (
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Item Name</th>
                  <th>HSN</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.hsnCode}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}

                {/* Calculate subtotal and GST */}
                {(() => {
                  const freightAmount = Number(viewFreight) || 0;

                  const itemTotal = selectedItems.reduce(
                    (sum, item) => sum + item.quantity * item.price,
                    0
                  );

                  const subtotal = itemTotal + freightAmount; // subtotal includes freight

                  const gstOnItems = selectedItems.reduce(
                    (sum, item) => sum + (item.quantity * item.price * item.gstRate) / 100,
                    0
                  );

                  const gstOnFreight = (18 / 100) * freightAmount;
                  const totalGST = gstOnItems + gstOnFreight;

                  const grandTotal = subtotal + totalGST;

                  return (
                    <>
                      <tr className="table-light fw-bold">
                        <td colSpan="4" className="text-end">Freight Charges</td>
                        <td>₹{freightAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="table-light fw-bold">
                        <td colSpan="4" className="text-end">Subtotal (Items + Freight)</td>
                        <td>₹{subtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="table-light fw-bold">
                        <td colSpan="4" className="text-end">GST</td>
                        <td>₹{totalGST.toFixed(2)}</td>
                      </tr>
                      <tr className="table-warning fw-bold">
                        <td colSpan="4" className="text-end">Grand Total</td>
                        <td>₹{grandTotal.toFixed(2)}</td>
                      </tr>
                    </>
                  );
                })()}

              </tbody>
            </table>
          )}
        </DialogContent>

      </Dialog>

      <Dialog
        open={showDownloadDialog}
        onClose={() => {
          setShowDownloadDialog(false);
          setDownloadAll(false);
          setFromDate('');
          setToDate('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select Download Option</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="downloadAll"
                checked={downloadAll}
                onChange={(e) => setDownloadAll(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="downloadAll">
                Download all sales
              </label>
            </div>

            <TextField
              label="From Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              fullWidth
              disabled={downloadAll}
            />
            <TextField
              label="To Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              fullWidth
              disabled={downloadAll}
            />

            <Button
              variant="contained"
              onClick={async () => {
                if (!downloadAll && (!fromDate || !toDate)) {
                  alert("Please select both From and To dates.");
                  return;
                }

                try {
                  let url = "/api/sales/download-report";
                  if (!downloadAll) {
                    url += `?from=${fromDate}&to=${toDate}`;
                  }

                  const res = await fetch(url, {
                    method: 'GET',
                  });

                  if (!res.ok) {
                    throw new Error("Download failed");
                  }

                  const blob = await res.blob();
                  const href = window.URL.createObjectURL(blob);

                  const link = document.createElement('a');
                  link.href = href;
                  link.setAttribute('download', 'Purchase_Report.xlsx');
                  document.body.appendChild(link);
                  link.click();
                  link.remove();

                  setShowDownloadDialog(false);
                } catch (err) {
                  console.error("Error downloading report:", err);
                  alert("Failed to download report");
                }
              }}
            >
              Download
            </Button>


          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Sales;
