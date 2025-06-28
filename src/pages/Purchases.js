import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import PurchaseForm from '../components/purchases/PurchaseForm';
import 'bootstrap/dist/css/bootstrap.min.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [downloadAll, setDownloadAll] = useState(false);
  const [viewFreight, setViewFreight] = useState(0);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get('/api/purchases');
      setPurchases(res.data);
    } catch (err) {
      console.error('Error fetching purchases:', err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleViewItems = (items, freight) => {
    setSelectedItems(items);
    setViewFreight(freight);
    setOpenDialog(true);
  };

  const handleDownloadReport = () => {
    setShowDownloadDialog(true);
  };


  const filteredPurchases = purchases
    .filter(p =>
      p.invoiceNo.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.invoiceDate);
      const dateB = new Date(b.invoiceDate);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  return (
  <Box sx={{ p: 3 }}>
    {/* Heading */}
    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
      Purchase Management
    </Typography>

    {/* Buttons */}
    <Stack direction="row" spacing={2} mb={3}>
      <Button
        variant={showForm ? 'outlined' : 'contained'}
        color="primary"
        onClick={() => setShowForm(!showForm)}
        sx={{ textTransform: 'none', fontWeight: 500 }}
      >
        {showForm ? 'Hide Form' : 'New Purchase'}
      </Button>

      <Button
        variant="outlined"
        onClick={handleDownloadReport}
        sx={{ textTransform: 'none', fontWeight: 500 }}
      >
        Download Report
      </Button>
    </Stack>

    {/* Search & Sort */}
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
      <TextField
        label="Search Invoice No"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ width: '250px' }}
      />
      <Button
        variant="outlined"
        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        size="small"
        sx={{ textTransform: 'none', fontWeight: 500 }}
      >
        Sort Date: {sortOrder === 'asc' ? 'Old → New' : 'New → Old'}
      </Button>
    </Stack>

    {/* Conditionally show Purchase Form */}
    {showForm && (
      <Box mb={4}>
        <PurchaseForm onSaved={fetchPurchases} />
      </Box>
    )}

    {/* Table Section */}
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        All Purchases
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        <table className="table table-bordered table-striped table-hover mt-3">
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr className="text-center">
              <th>Invoice No</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>GSTIN</th>
              <th>Item Count</th>
              <th>Freight</th>
              <th>Total</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">No purchases found.</td>
              </tr>
            ) : (
              filteredPurchases.map((purchase, idx) => {
                const freightAmount = Number(purchase.freight || 0);
                const itemSubtotal = purchase.items.reduce((sum, i) =>
                  sum + (i.quantity * i.price) + ((i.quantity * i.price * i.gstRate) / 100), 0);
                const freightGst = (18 / 100) * freightAmount;
                const total = itemSubtotal + freightAmount + freightGst;

                return (
                  <tr key={idx}>
                    <td>{purchase.invoiceNo}</td>
                    <td>{purchase.invoiceDate}</td>
                    <td>{purchase.vendorName}</td>
                    <td>{purchase.gstin}</td>
                    <td>{purchase.items.length}</td>
                    <td>₹{freightAmount.toFixed(2)}</td>
                    <td>₹{total.toFixed(2)}</td>
                    <td className="text-center">
                      <IconButton onClick={() => handleViewItems(purchase.items, purchase.freight)}>
                        <VisibilityIcon />
                      </IconButton>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
    </Paper>


      {/* Dialog for viewing items */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Items in Purchase</DialogTitle>
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

                  const gst = gstOnItems + (18 / 100) * freightAmount;

                  const total = subtotal + gst;

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
                        <td colSpan="4" className="text-end">GST </td>
                        <td>₹{gst.toFixed(2)}</td>
                      </tr>
                      <tr className="table-warning fw-bold">
                        <td colSpan="4" className="text-end">Grand Total</td>
                        <td>₹{total.toFixed(2)}</td>
                      </tr>
                    </>
                  );
                })()}


              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>


      {/* Date range dialog for download */}
      <Dialog open={showDownloadDialog} onClose={() => {
        setShowDownloadDialog(false);
        setDownloadAll(false);
        setFromDate('');
        setToDate('');
      }} maxWidth="xs" fullWidth>
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
                Download all purchases
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
                  let url = "/api/purchases/download-report";
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

export default Purchases;
