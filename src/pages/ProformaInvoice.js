import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent,
  IconButton, TextField, Select, MenuItem
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';
import ProformaInvoiceForm from '../components/proforma/ProformaInvoiceForm';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Menu} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';


const ProformaInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewFreight, setViewFreight] = useState(0);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [editInvoice, setEditInvoice] = useState(null);

  const [anchorEls, setAnchorEls] = useState({});

const handleMenuOpen = (event, index) => {
  setAnchorEls((prev) => ({ ...prev, [index]: event.currentTarget }));
};

const handleMenuClose = (index) => {
  setAnchorEls((prev) => ({ ...prev, [index]: null }));
};

const handleDownload = (invoice) => {
  console.log("Download", invoice);
  handleMenuClose(invoice.id);
};

const handleEdit = (invoice) => {
  console.log("Edit:---", invoice);
  handleMenuClose(invoice.id);
};

const handleDelete = (id) => {
  console.log("Delete", id);
  handleMenuClose(id);
};


  const fetchInvoices = async () => {
    try {
const res = await axios.get(`${BASE_URL}/proforma-invoices`);
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching proforma invoices:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewItems = (items, freight) => {
    setSelectedItems(items);
    setViewFreight(freight);
    setOpenDialog(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
await axios.put(`${BASE_URL}/proforma-invoices/${id}/status`, { status: newStatus });
      setInvoices((prevInvoices) =>
        prevInvoices.map(s => (s.id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const filteredInvoices = invoices
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
      Proforma Invoice Management
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
        {showForm ? 'Hide Form' : 'Generate New Proforma Invoice'}
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
        <MenuItem value="order-confirmed">Order Confirmed</MenuItem>
        <MenuItem value="cancelled">Cancelled</MenuItem>
      </TextField>
    </Stack>

    {/* Invoice Form */}
{showForm && (
  <Box mb={4}>
    <ProformaInvoiceForm
      editData={editInvoice}
      onSaved={() => {
        setShowForm(false);
        setEditInvoice(null);
        fetchInvoices(); // Refresh list
      }}
    />
  </Box>
)}

    {/* Invoices Table */}
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        All Proforma Invoices
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center text-muted">
                  No proforma invoices found.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice, idx) => {
                const freightAmount = Number(invoice.freight || 0);
                const itemSubtotal = invoice.items.reduce((sum, i) =>
                  sum + (i.quantity * i.price) + ((i.quantity * i.price * i.gstRate) / 100), 0);
                const freightGst = (18 / 100) * freightAmount;
                const total = itemSubtotal + freightAmount + freightGst;

                return (
                  <tr key={idx}>
                    <td>{invoice.invoiceNo}</td>
                    <td>{invoice.invoiceDate}</td>
                    <td>{invoice.customerName}</td>
                    <td>{invoice.gstin}</td>
                    <td>{invoice.items.length}</td>
                    <td>₹{freightAmount.toFixed(2)}</td>
                    <td>₹{total.toFixed(2)}</td>
                    <td className="text-center">
                      <IconButton onClick={() => handleViewItems(invoice.items, invoice.freight)}>
                        <VisibilityIcon />
                      </IconButton>
                    </td>
                    <td>
                      <Box
                        sx={{
                          backgroundColor:
                            invoice.status === 'under-process' ? '#fff3cd' :
                              invoice.status === 'order-confirmed' ? '#e1f5fe' :
                                invoice.status === 'cancelled' ? '#ffebee' : 'white',
                          borderRadius: 1,
                          px: 1,
                        }}
                      >
                        <Select
                          size="small"
                          value={invoice.status || 'under-process'}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          variant="standard"
                          fullWidth
                        >
                          <MenuItem value="under-process">Under Process</MenuItem>
                          <MenuItem value="order-confirmed">Order Confirmed</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </Box>
                    </td>
                    <td className="text-center">
<IconButton onClick={(e) => handleMenuOpen(e, idx)}>
  <MoreVertIcon />
</IconButton>
<Menu
  anchorEl={anchorEls[idx]}
  open={Boolean(anchorEls[idx])}
  onClose={() => handleMenuClose(idx)}
>
  <MenuItem onClick={() => handleDownload(invoice)}>Download</MenuItem>
  <MenuItem onClick={() => { console.log('Editing invoice:', invoice); setEditInvoice(invoice); setShowForm(true); handleMenuClose(idx) }}>Edit</MenuItem>
  <MenuItem onClick={() => handleDelete(invoice.id)}>Delete</MenuItem>
</Menu>

</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Box>
    </Paper>

    {/* Items Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Items in Proforma Invoice</DialogTitle>
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
    </Box>
  );
};

export default ProformaInvoice;
