import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Stack, Grid, MenuItem 
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import api from '../../services/api';

const itemOptions = [
  "printer", "scanner", "desktop", "laptop", "plotter", "server", "activity", "cctv", 
  "UPS", "Mouse", "Keyboard", "PowerSupply", "Motherboard", "HardDisk", "Display", 
  "RAM", "CPUFan", "Processor", "MilerStrip", "PaperPickupRoller", "PhotoSensor", 
  "LogicCard", "PrintHead", "Teflon", "PressureRoller", "Gear", "CarriageBlock", 
  "AllInOne", "Cable", "SSD", "TFT"
];

const StockEntry = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemPart: '',
    serialNumber: '',
    configuration: '',
    modelNumber: '',
    amcStartDate: '',
    amcEndDate: '',
    price: '',
    condition: ''
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
      const response = await api.post('/stock', formData);
      toast.success(`Stock created with stock id: ${response.data.data.stockId}`);
      setFormData({
        itemName: '', itemPart: '', serialNumber: '', configuration: '',
        modelNumber: '', amcStartDate: '', amcEndDate: '', price: '', condition: ''
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Stock Entry" />
      
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField 
                    select 
                    label="Item Name" 
                    name="itemName" 
                    value={formData.itemName} 
                    onChange={handleChange} 
                    required 
                    size="small"
                  >
                    {itemOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Group (Item Part)" name="itemPart" value={formData.itemPart} onChange={handleChange} required size="small" />
                  <TextField label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required size="small" />
                  <TextField label="Configuration" name="configuration" value={formData.configuration} onChange={handleChange} required size="small" />
                  <TextField label="Model" name="modelNumber" value={formData.modelNumber} onChange={handleChange} required size="small" />
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  <TextField 
                    type="date" 
                    label="Warranty Start Date" 
                    name="amcStartDate" 
                    value={formData.amcStartDate} 
                    onChange={handleChange} 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    size="small"
                  />
                  <TextField 
                    type="date" 
                    label="Warranty End Date" 
                    name="amcEndDate" 
                    value={formData.amcEndDate} 
                    onChange={handleChange} 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    size="small"
                  />
                  <TextField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleChange} required size="small" />
                  <TextField 
                    select 
                    label="Condition" 
                    name="condition" 
                    value={formData.condition} 
                    onChange={handleChange} 
                    required 
                    size="small"
                  >
                    <MenuItem value="working">Working</MenuItem>
                    <MenuItem value="faulty">Faulty</MenuItem>
                    <MenuItem value="new">New</MenuItem>
                    <MenuItem value="repaired">Repaired</MenuItem>
                  </TextField>
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

export default StockEntry;
