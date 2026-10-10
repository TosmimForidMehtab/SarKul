import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Stack, Grid 
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import api from '../../services/api';

const BranchStockEntry = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    serialNumber: '',
    brand: '',
    warrantyStart: '',
    warrantyEnd: '',
    price: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/mystocks', formData);
      toast.success(response.data.message || 'Branch stock entry created successfully');
      setFormData({
        itemName: '', serialNumber: '', brand: '', warrantyStart: '', warrantyEnd: '', price: ''
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create branch stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Branch Stock Entry" />
      
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField label="Item Name" name="itemName" value={formData.itemName} onChange={handleChange} required size="small" />
                  <TextField label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required size="small" />
                  <TextField label="Brand" name="brand" value={formData.brand} onChange={handleChange} required size="small" />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField 
                    type="date" 
                    label="Warranty Start Date" 
                    name="warrantyStart" 
                    value={formData.warrantyStart} 
                    onChange={handleChange} 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    size="small"
                  />
                  <TextField 
                    type="date" 
                    label="Warranty End Date" 
                    name="warrantyEnd" 
                    value={formData.warrantyEnd} 
                    onChange={handleChange} 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    size="small"
                  />
                  <TextField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} required size="small" />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Entry'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BranchStockEntry;
