import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box, Button, Typography, TextField, Snackbar, Alert, Modal, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip, LinearProgress,
  Chip
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// GSTIN validation regex
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    gstin: '',
    contact: '',
    address: ''
  });
  const [errors, setErrors] = useState({
    name: false,
    gstin: false,
    contact: false
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch vendors
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/vendors');
      setVendors(res.data);
    } catch (err) {
      showSnackbar('Failed to fetch vendors', 'error');
      console.error('Fetch vendors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Form handlers
  const openForm = (vendor = null) => {
    if (vendor) {
      setEditingId(vendor.id);
      setFormData({
        name: vendor.name,
        gstin: vendor.gstin,
        contact: vendor.contact,
        address: vendor.address
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        gstin: '',
        contact: '',
        address: ''
      });
    }
    setErrors({
      name: false,
      gstin: false,
      contact: false
    });
    setOpenModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      gstin: !GSTIN_REGEX.test(formData.gstin),
      contact: !formData.contact.trim()
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`/api/vendors/${editingId}`, formData);
        showSnackbar('Vendor updated successfully', 'success');
      } else {
        await axios.post('/api/vendors', formData);
        showSnackbar('Vendor added successfully', 'success');
      }
      setOpenModal(false);
      fetchVendors();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Operation failed', 'error');
      console.error('Submit error:', err);
    }
  };

  // Delete handlers
  const confirmDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/vendors/${deleteId}`);
      showSnackbar('Vendor deleted successfully', 'success');
      fetchVendors();
    } catch (err) {
      showSnackbar('Failed to delete vendor', 'error');
      console.error('Delete error:', err);
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // View vendor details
  const viewVendor = (vendor) => {
    setSelectedVendor(vendor);
  };

  // Snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Columns
  const columns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Typography fontWeight="bold" color="primary.main">
          {params.value}
        </Typography>
      ),
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
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.9rem" }}>
          📞 {params.value}
        </Typography>
      )
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography sx={{ fontSize: "0.85rem", color: "#555" }}>
            {params.value?.length > 20 ? `${params.value.substring(0, 20)}...` : params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="View"><ViewIcon sx={{ color: "#0277bd" }} /></Tooltip>}
          label="View"
          onClick={() => viewVendor(params.row)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Edit"><EditIcon sx={{ color: "#2e7d32" }} /></Tooltip>}
          label="Edit"
          onClick={() => openForm(params.row)}
        />,
        <GridActionsCellItem
          icon={<Tooltip title="Delete"><DeleteIcon sx={{ color: "#d32f2f" }} /></Tooltip>}
          label="Delete"
          onClick={() => confirmDelete(params.id)}
        />
      ]
    }
  ], []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1, color: "#2c3e50" }}
        >
          <span role="img" aria-label="vendors">👥</span> Vendor Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              mr: 1,
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#2980b9",
              "&:hover": { backgroundColor: "#2471a3" }
            }}
            onClick={fetchVendors}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              backgroundColor: "#27ae60",
              "&:hover": { backgroundColor: "#219150" }
            }}
            onClick={() => openForm()}
          >
            Add Vendor
          </Button>

        </Box>
      </Box>

      {loading && <LinearProgress />}

      <Box sx={{ height: 600, width: '100%', mt: 2 }}>
        <DataGrid
          rows={vendors}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          sx={{
            borderRadius: 3,
            fontFamily: `'Segoe UI', Roboto, sans-serif`,
            fontSize: "0.9rem",
            boxShadow: 3,
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f1f1f1",
              color: "#424242",
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.8rem",
            },
            "& .MuiDataGrid-cell": {
              py: 1.5,
              px: 1,
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#fafafa",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#e3f2fd",
              cursor: "pointer"
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#f9f9f9",
            },
          }}

        />

      </Box>

      {/* Add/Edit Vendor Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="vendor-modal-title"
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 420,
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: 5,
            p: 4,
          }}

        >
          <IconButton
            aria-label="close"
            onClick={() => setOpenModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography id="vendor-modal-title" variant="h6" gutterBottom>
            {editingId ? 'Edit Vendor' : 'Add Vendor'}
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            label="Vendor Name"
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            {editingId ? 'Update Vendor' : 'Add Vendor'}
          </Button>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vendor?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>

      </Dialog>

      {/* View Vendor Dialog */}
      <Dialog
        open={Boolean(selectedVendor)}
        onClose={() => setSelectedVendor(null)}
      >
        <DialogTitle>Vendor Details</DialogTitle>
        <DialogContent>
          {selectedVendor && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Name:</strong> {selectedVendor.name}</Typography>
              <Typography><strong>GSTIN:</strong> {selectedVendor.gstin}</Typography>
              <Typography><strong>Contact:</strong> {selectedVendor.contact}</Typography>
              <Typography><strong>Address:</strong> {selectedVendor.address}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedVendor(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            fontSize: "0.9rem",
            boxShadow: 2,
            borderRadius: 1
          }}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default Vendors;