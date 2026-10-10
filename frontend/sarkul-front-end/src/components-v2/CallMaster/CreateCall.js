import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Grid, Button, MenuItem, Stack, Divider, Autocomplete 
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import api from '../../services/api';

const CreateCall = () => {
  const [formData, setFormData] = useState({
    serialNumber: '',
    customerName: '',
    customerCode: '',
    userName: '',
    contactNumber: '',
    customerEmail: '',
    customerAddress: '',
    category: '',
    itemName: '',
    itemModelNumber: '',
    problemDescription: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/group');
        let temp = [];
        res?.data?.data[0]?.data?.forEach((item) => {
          if (!item.groupName.includes('test') && !item.groupName.includes('Test')) {
            temp.push(item.groupName);
          }
        });
        setGroups(temp);
      } catch (err) {
        console.error("Failed to load groups");
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/call', formData);
      toast.success('Call logged successfully! Call No: ' + res.data.data);
      setFormData({
        serialNumber: '', customerName: '', customerCode: '', userName: '', 
        contactNumber: '', customerEmail: '', customerAddress: '', category: '', 
        itemName: '', itemModelNumber: '', problemDescription: '', priority: 'medium'
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to log call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Call Log" />
      
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" color="primary" gutterBottom>
              Customer Details
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="User Name" name="userName" value={formData.userName} onChange={handleChange} required size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} required size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Customer Code" name="customerCode" value={formData.customerCode} onChange={handleChange} required size="small" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Contact Number" type="number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required size="small" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Email ID" type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} size="small" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Address" name="customerAddress" value={formData.customerAddress} onChange={handleChange} required size="small" />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" color="primary" gutterBottom>
              Call Details
            </Typography>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth label="Category" name="category" value={formData.category} onChange={handleChange} required size="small">
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="desktop">Desktop</MenuItem>
                  <MenuItem value="laptop">Laptop</MenuItem>
                  <MenuItem value="printer">Printer</MenuItem>
                  <MenuItem value="plotter">Plotter</MenuItem>
                  <MenuItem value="scanner">Scanner</MenuItem>
                  <MenuItem value="server">Server</MenuItem>
                  <MenuItem value="UPS">UPS</MenuItem>
                  <MenuItem value="cctv">CCTV</MenuItem>
                  <MenuItem value="activity">Activity</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={groups}
                  value={formData.itemName}
                  onChange={(e, newValue) => setFormData({ ...formData, itemName: newValue || '' })}
                  renderInput={(params) => <TextField {...params} label="Group (Item Name)" required size="small" />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Model Number" name="itemModelNumber" value={formData.itemModelNumber} onChange={handleChange} required size="small" />
              </Grid>
              <Grid item xs={12} md={12}>
                <TextField fullWidth label="Problem Description" name="problemDescription" value={formData.problemDescription} onChange={handleChange} multiline rows={3} required size="small" />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button variant="outlined" color="secondary" type="button" onClick={() => setFormData({
                serialNumber: '', customerName: '', customerCode: '', userName: '', 
                contactNumber: '', customerEmail: '', customerAddress: '', category: '', 
                itemName: '', itemModelNumber: '', problemDescription: '', priority: 'medium'
              })}>
                Reset
              </Button>
              <Button variant="contained" color="primary" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateCall;
