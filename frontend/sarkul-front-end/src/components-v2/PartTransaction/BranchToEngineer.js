import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Grid, TextField, MenuItem, Button, 
  CircularProgress, Autocomplete 
} from '@mui/material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import api from '../../services/api';
import PageHeader from '../shared/PageHeader';
import { useDebounce } from '../../hooks/useDebounce';

const BranchToEngineer = () => {
  const [loading, setLoading] = useState(false);
  
  // Autocomplete states
  const [callOptions, setCallOptions] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [engineerOptions, setEngineerOptions] = useState([]);
  
  const fetchCalls = async (search = '') => {
    try {
      const res = await api.get(`/call/lookup?q=${search}`);
      setCallOptions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async (search = '') => {
    try {
      const res = await api.get(`/stock/lookup?q=${search}`);
      setStockOptions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEngineers = async () => {
    try {
      const res = await api.get(`/engineer?status=active`);
      setEngineerOptions(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []));
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger default loads
  React.useEffect(() => {
    fetchCalls('');
    fetchStocks('');
    fetchEngineers('');
  }, []);

  const formik = useFormik({
    initialValues: {
      callId: '',
      itemName: '',
      partName: '',
      modelNumber: '',
      stockId: '',
      serialNumber: '',
      dispatchMode: '',
      engineerName: '',
      category: 'b2e',
      status: 'unavailable'
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await api.post('/transaction', values);
        toast.success(response?.data?.message || 'Transaction completed successfully');
        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error processing transaction');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box>
      <PageHeader title="Branch To Engineer (B2E)" />
      
      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={callOptions}
                  getOptionLabel={(option) => option.callId || ''}
                  onInputChange={(e, value) => fetchCalls(value)}
                  onChange={(e, value) => formik.setFieldValue('callId', value?.callId || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Call Number" required fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={stockOptions}
                  getOptionLabel={(option) => option.stockId ? `${option.stockId} - ${option.itemName}` : ''}
                  onInputChange={(e, value) => fetchStocks(value)}
                  onChange={(e, value) => {
                    formik.setFieldValue('stockId', value?.stockId || '');
                    formik.setFieldValue('itemName', value?.itemName || '');
                    formik.setFieldValue('serialNumber', value?.serialNumber || '');
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Stock ID" required fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={engineerOptions}
                  getOptionLabel={(option) => option.employeeName || ''}
                  onChange={(e, value) => formik.setFieldValue('engineerName', value?.employeeName || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Engineer Name" required fullWidth />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Item Name"
                  name="itemName"
                  value={formik.values.itemName}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="printer">Printer</MenuItem>
                  <MenuItem value="scanner">Scanner</MenuItem>
                  <MenuItem value="desktop">Desktop</MenuItem>
                  <MenuItem value="laptop">Laptop</MenuItem>
                  <MenuItem value="plotter">Plotter</MenuItem>
                  <MenuItem value="server">Server</MenuItem>
                  <MenuItem value="activity">Activity</MenuItem>
                  <MenuItem value="cctv">CCTV</MenuItem>
                  <MenuItem value="UPS">UPS</MenuItem>
                  <MenuItem value="Mouse">Mouse</MenuItem>
                  <MenuItem value="Keyboard">Keyboard</MenuItem>
                  <MenuItem value="PowerSupply">Power Supply</MenuItem>
                  <MenuItem value="Motherboard">Motherboard</MenuItem>
                  <MenuItem value="HardDisk">Hard Disk</MenuItem>
                  <MenuItem value="Display">Display</MenuItem>
                  <MenuItem value="RAM">RAM</MenuItem>
                  <MenuItem value="CPUFan">CPU Fan</MenuItem>
                  <MenuItem value="Processor">Processor</MenuItem>
                  <MenuItem value="MilerStrip">Miler Strip</MenuItem>
                  <MenuItem value="PaperPickupRoller">Paper Pickup Roller</MenuItem>
                  <MenuItem value="PhotoSensor">Photo Sensor</MenuItem>
                  <MenuItem value="LogicCard">Logic Card</MenuItem>
                  <MenuItem value="PrintHead">Print Head</MenuItem>
                  <MenuItem value="Teflon">Teflon</MenuItem>
                  <MenuItem value="PressureRoller">Pressure Roller</MenuItem>
                  <MenuItem value="Gear">Gear</MenuItem>
                  <MenuItem value="CarriageBlock">Carriage Block</MenuItem>
                  <MenuItem value="AllInOne">All In One</MenuItem>
                  <MenuItem value="Cable">Cable</MenuItem>
                  <MenuItem value="SSD">SSD</MenuItem>
                  <MenuItem value="TFT">TFT</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Part Name"
                  name="partName"
                  value={formik.values.partName}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model Number"
                  name="modelNumber"
                  value={formik.values.modelNumber}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Serial Number"
                  name="serialNumber"
                  value={formik.values.serialNumber}
                  onChange={formik.handleChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Dispatch Mode"
                  name="dispatchMode"
                  value={formik.values.dispatchMode}
                  onChange={formik.handleChange}
                  required
                >
                  <MenuItem value="RGP">RGP</MenuItem>
                  <MenuItem value="NRGP">NRGP</MenuItem>
                  <MenuItem value="consumable">Consumable</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Submit Transaction
                </Button>
              </Grid>
              
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BranchToEngineer;


