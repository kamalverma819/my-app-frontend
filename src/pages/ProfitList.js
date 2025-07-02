import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Dialog, DialogTitle, DialogContent, TextField, Stack,
  Button
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import Profit from './Profit';

const ProfitList = () => {
  const [profits, setProfits] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
const [showProfit, setShowProfit] = useState(false);
const [editCommission, setEditCommission] = useState({});
const [isSaving, setIsSaving] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;


const handleSaveCommission = async (item) => {
  try {
    setIsSaving(true);

    const newCommission = parseFloat(editCommission[item.itemId]);
    const isPercent = item.isPercent ?? false; // or use a UI checkbox toggle if needed

    if (isNaN(newCommission) || newCommission < 0) {
      alert("Invalid commission");
      return;
    }

    // Send to new endpoint that updates commission on Item
await axios.put(`${BASE_URL}/items/${item.itemId}/commission`, {
  commission: newCommission,
  isPercent: isPercent
});


    fetchProfits(); // Refresh profit list
  } catch (err) {
    console.error(err);
    alert("Failed to update commission");
  } finally {
    setIsSaving(false);
  }
};



  const fetchProfits = async () => {
    try {
      const params = {};
      if (fromDate) params.from = fromDate.toISOString().split('T')[0];
      if (toDate) params.to = toDate.toISOString().split('T')[0];
const res = await axios.get(`${BASE_URL}/sales/profit/all`, { params });
      setProfits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProfits(); }, []);

const handleView = (item) => {
  setSelectedItemId(item.itemId);
  setShowProfit(true);
};


  const COLORS = ['#4a148c', '#ff6f00'];
  const totalProfit = profits.reduce((sum, item) => sum + (item.totalProfit || 0), 0);
  const topItem = profits.reduce((max, curr) =>
    (curr.totalProfit || 0) > (max.totalProfit || 0) ? curr : max, {});

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>📋 All Item Profit List</Typography>

        {/* Date Filter */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={setFromDate}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={setToDate}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
          <Button
  variant="contained"
  color="primary"
  onClick={fetchProfits}
  sx={{ height: '56px' }}
>
  Apply Filter
</Button>
        </Stack>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Item</strong></TableCell>
              <TableCell><strong>Buying</strong></TableCell>
              <TableCell><strong>Sold</strong></TableCell>
              <TableCell><strong>Avg SP</strong></TableCell>
              <TableCell><strong>Commission</strong></TableCell>
              <TableCell><strong>Profit</strong></TableCell>
              <TableCell align="center"><strong>👁️</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profits.map((item) => (
              <TableRow key={item.itemId}>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>₹{item.buyingPrice}</TableCell>
                <TableCell>{item.quantitySold}</TableCell>
                <TableCell>₹{item.averageSellingPrice.toFixed(2)}</TableCell>
                <TableCell>
  <Stack direction="row" spacing={1} alignItems="center">
    <TextField
      variant="standard"
      type="number"
      size="small"
      value={editCommission[item.itemId] ?? item.totalCommission.toFixed(2)}
      onChange={(e) =>
        setEditCommission({ ...editCommission, [item.itemId]: e.target.value })
      }
      sx={{ width: 80 }}
    />
    <IconButton
      onClick={() => handleSaveCommission(item)}
      size="small"
      disabled={isSaving}
      color="primary"
    >
      💾
    </IconButton>
  </Stack>
</TableCell>



                <TableCell>₹{item.totalProfit.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleView(item)}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* ✅ Total Profit */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="primary">
            🧾 Total Profit of All Items: ₹{totalProfit.toFixed(2)}
          </Typography>
        </Box>

        {/* 🥧 Pie Chart for top item */}
        {profits.length > 0 && topItem && (
          <Box mt={5}>
            <Typography variant="h6">
              🥧 Top Item: {topItem?.itemName} Profit vs Commission
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Profit', value: topItem.totalProfit },
                    { name: 'Commission', value: topItem.totalCommission }
                  ]}
                  dataKey="value"
                  outerRadius={100}
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>📦 {selectedItem?.itemName} - Full Profit Details</DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box sx={{ p: 1 }}>
                <Typography><strong>Buying Price:</strong> ₹{selectedItem.buyingPrice}</Typography>
                <Typography><strong>Quantity Sold:</strong> {selectedItem.quantitySold}</Typography>
                <Typography><strong>Average Selling Price:</strong> ₹{selectedItem.averageSellingPrice.toFixed(2)}</Typography>
                <Typography><strong>Total Commission:</strong> ₹{selectedItem.totalCommission.toFixed(2)}</Typography>
                <Typography><strong>Total Profit:</strong> ₹{selectedItem.totalProfit.toFixed(2)}</Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        <Profit
  itemId={selectedItemId}
  open={showProfit}
  onClose={() => setShowProfit(false)}
/>

      </Box>
    </LocalizationProvider>
  );

  
};

export default ProfitList;
