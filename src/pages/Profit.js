import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Divider, Stack, TextField, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const Profit = ({ itemId, open, onClose }) => {
  const [profitData, setProfitData] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const fetchProfit = async () => {
    try {
      const params = {};
      if (fromDate) params.from = fromDate.toISOString().split('T')[0];
      if (toDate) params.to = toDate.toISOString().split('T')[0];

      const [profitRes, itemRes] = await Promise.all([
        axios.get(`/api/sales/profit/${itemId}`, { params }),
        axios.get(`/api/items/${itemId}`)
      ]);
      setProfitData(profitRes.data);
      setItemDetails(itemRes.data);
    } catch (error) {
      console.error("Error fetching profit:", error);
    }
  };

  useEffect(() => {
    if (itemId && open) {
      fetchProfit();
    }
  }, [itemId, open, fromDate, toDate]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>📦 Profit Report</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ mt: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <DatePicker
                label="From"
                value={fromDate}
                onChange={setFromDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="To"
                value={toDate}
                onChange={setToDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Stack>

            {profitData && itemDetails && (
              <Card sx={{ mt: 2, borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6">{profitData.itemName}</Typography>
                  <Divider sx={{ my: 2 }} />

                  <Typography><strong>🧾 Buying Price:</strong> ₹{profitData.buyingPrice}</Typography>
                  <Typography><strong>📦 Quantity Sold:</strong> {profitData.totalQuantitySold}</Typography>
                  <Typography><strong>💰 Avg Selling Price:</strong> ₹{profitData.averageSellingPrice.toFixed(2)}</Typography>
                  <Typography><strong>🧾 Total Commission:</strong> ₹{profitData.totalCommission.toFixed(2)}</Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    🧮 Total Profit: ₹{profitData.totalProfit.toFixed(2)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>📈 Profit Summary</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={[
                      { name: 'Buying Price', value: profitData.buyingPrice },
                      { name: 'Avg Selling', value: profitData.averageSellingPrice },
                      { name: 'Commission', value: profitData.totalCommission },
                      { name: 'Profit', value: profitData.totalProfit }
                    ]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#4a148c" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        </LocalizationProvider>
      </DialogContent>
    </Dialog>
  );
};

export default Profit;
