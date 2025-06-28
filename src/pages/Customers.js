import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box, Button, Typography, TextField, Snackbar, Alert, Modal, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, LinearProgress
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    contact: '',
    address: ''
  });

  const [errors, setErrors] = useState({
    name: false,
    contact: false,
    gstin: false 
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;




  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      showSnackbar('Failed to fetch customers', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openForm = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        gstin: customer.gstin,
        contact: customer.contact,
        address: customer.address
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', contact: '', address: '',gstin: '' });
    }
    setErrors({ name: false, contact: false });
    setOpenModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
  const newErrors = {
    name: !formData.name.trim(),
    contact: !formData.contact.trim(),
    gstin: !GSTIN_REGEX.test(formData.gstin)
  };
  setErrors(newErrors);
  return !Object.values(newErrors).some(Boolean);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`/api/customers/${editingId}`, formData);
        showSnackbar('Customer updated successfully', 'success');
      } else {
        await axios.post('/api/customers', formData);
        showSnackbar('Customer added successfully', 'success');
      }
      setOpenModal(false);
      fetchCustomers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
      console.error(err);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/customers/${deleteId}`);
      showSnackbar('Customer deleted successfully', 'success');
      fetchCustomers();
    } catch (err) {
      showSnackbar('Failed to delete customer', 'error');
      console.error(err);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const viewCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = useMemo(() => [
  { 
    field: 'name', 
    headerName: 'Name', 
    width: 200 
  },
  {
    field: 'gstin',
    headerName: 'GSTIN',
    width: 200,
    renderCell: (params) => (
      <Typography
        sx={{
          fontSize: "0.85rem",
          fontFamily: "monospace",
          color: "#333",
        }}
      >
        {params.value}
      </Typography>
    )
  },
  { 
    field: 'contact', 
    headerName: 'Contact', 
    width: 150 
  },
  {
    field: 'address',
    headerName: 'Address',
    width: 250,
    renderCell: (params) => (
      <Tooltip title={params.value}>
        <span>{params.value?.length > 20 ? `${params.value.substring(0, 20)}...` : params.value}</span>
      </Tooltip>
    )
  },
  {
    field: 'actions',
    type: 'actions',
    width: 150,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<Tooltip title="View"><ViewIcon /></Tooltip>}
        label="View"
        onClick={() => viewCustomer(params.row)}
      />,
      <GridActionsCellItem
        icon={<Tooltip title="Edit"><EditIcon /></Tooltip>}
        label="Edit"
        onClick={() => openForm(params.row)}
      />,
      <GridActionsCellItem
        icon={<Tooltip title="Delete"><DeleteIcon color="error" /></Tooltip>}
        label="Delete"
        onClick={() => confirmDelete(params.id)}
      />
    ]
  }
], []);


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
<Typography variant="h4" fontWeight="bold" gutterBottom>
  🧑‍💼 Customers
</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
  <Button
    variant="outlined"
    startIcon={<RefreshIcon />}
    onClick={fetchCustomers}
    sx={{
              mr: 1,
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#2980b9",
              "&:hover": { backgroundColor: "#2471a3" }
            }}
  >
    Refresh
  </Button>

  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => openForm()}
    sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#27ae60",
              "&:hover": { backgroundColor: "#219150" }
            }}
  >
    Add Customer
  </Button>
</Box>

      </Box>

      {loading && <LinearProgress />}

      <Box sx={{ height: 600, width: '100%', mt: 2 }}>
        <DataGrid
  rows={customers}
  columns={columns}
  loading={loading}
  pageSize={10}
  rowsPerPageOptions={[10]}
  getRowId={(row) => row.id}
  disableSelectionOnClick
  sx={{
    borderRadius: 2,
    fontFamily: `'Segoe UI', Roboto, sans-serif`,
    fontSize: "0.9rem",
    boxShadow: 2,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#f8f9fa",
      fontWeight: "bold",
      textTransform: "uppercase",
      fontSize: "0.8rem",
    },
    "& .MuiDataGrid-row:nth-of-type(odd)": {
      backgroundColor: "#fafafa",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#e3f2fd",
    },
    "& .MuiDataGrid-cell": {
      padding: "10px",
    },
  }}
/>

      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: 'none'
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'gray' }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom>
            {editingId ? 'Edit Customer' : 'Add Customer'}
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Customer Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            helperText={errors.name ? 'Name is required' : ''}
          />
          <TextField
  margin="normal"
  required
  fullWidth
  label="GSTIN"
  name="gstin"
  value={formData.gstin}
  onChange={handleChange}
  error={errors.gstin}
  helperText={errors.gstin ? 'Invalid GSTIN format' : ''}
/>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            error={errors.contact}
            helperText={errors.contact ? 'Contact is required' : ''}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Address"
            name="address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            {editingId ? 'Update Customer' : 'Add Customer'}
          </Button>
        </Box>
      </Modal>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this customer?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)}>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Name:</strong> {selectedCustomer.name}</Typography>
              <Typography><strong>Contact:</strong> {selectedCustomer.contact}</Typography>
              <Typography><strong>Address:</strong> {selectedCustomer.address}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCustomer(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Customers;