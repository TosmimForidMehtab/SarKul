import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Grid, TextField, MenuItem, Button, 
  CircularProgress, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import api from '../../services/api';
import PageHeader from '../shared/PageHeader';

const EngineerToBranch = () => {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Autocomplete states
  const [callOptions, setCallOptions] = useState([]);
  const [stockOptions, setStockOptions] = useState([]);
  const [engineerOptions, setEngineerOptions] = useState([]);
  
  const fetchCalls = async (search = '') => {
    try {
      const res = await api.get(`/call/lookup?q=${search}`);
      let callsData = res.data.data || res.data;
      if (callsData && !Array.isArray(callsData) && Array.isArray(callsData.data)) callsData = callsData.data;
      setCallOptions(Array.isArray(callsData) ? callsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStocks = async (search = '') => {
    try {
      const res = await api.get(`/stock/lookup?q=${search}`);
      let stockData = res.data.data || res.data;
      if (stockData && !Array.isArray(stockData) && Array.isArray(stockData.data)) stockData = stockData.data;
      setStockOptions(Array.isArray(stockData) ? stockData : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEngineers = async () => {
    try {
      const res = await api.get(`/engineer?status=active&limit=1000`);
      setEngineerOptions(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []));
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchCalls('');
    fetchStocks('');
    fetchEngineers('');
  }, []);

  const formik2 = useFormik({
    initialValues: {
      itemName: '',
      itemPart: '',
      serialNumber: '',
      configuration: '',
      modelNumber: '',
      amcStartDate: '',
      amcEndDate: '',
      price: '',
      condition: '',
      officeRepair: 'yes'
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await api.post('/stock', values);
        toast.success(`Transaction created & Stock moved to office repair with stock id ${response.data.data?.stockId}`);
        setModalOpen(false);
        resetForm();
        formik.resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error processing repair stock');
      } finally {
        setLoading(false);
      }
    }
  });

  const formik = useFormik({
    initialValues: {
      callId: '',
      partStatus: '',
      itemName: '',
      partName: '',
      stockId: '',
      engineerName: '',
      category: 'e2b'
    },
    onSubmit: async (values) => {
      setLoading(true);
      
      formik2.setFieldValue('itemPart', values.partName);
      formik2.setFieldValue('itemName', values.itemName);
      formik2.setFieldValue('condition', values.partStatus);

      try {
        const response = await api.post('/transaction', values);
        toast.success(response?.data?.message || 'Transaction created');
        if (response.status === 210 || response.data?.status === 210) {
          setModalOpen(true);
        } else {
          formik.resetForm();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error processing transaction');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box>
      <PageHeader title="Engineer To Branch (E2B)" />
      
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
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Stock ID" required fullWidth />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Engineer Name"
                  name="engineerName"
                  value={formik.values.engineerName}
                  onChange={formik.handleChange}
                  required
                >
                  {engineerOptions.map((eng, idx) => (
                    <MenuItem key={idx} value={eng.employeeName}>{eng.employeeName}</MenuItem>
                  ))}
                </TextField>
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
                  <MenuItem value="plotter">Plotter</MenuItem>
                  <MenuItem value="desktop">Desktop</MenuItem>
                  <MenuItem value="laptop">Laptop</MenuItem>
                  <MenuItem value="server">Server</MenuItem>
                  <MenuItem value="UPS">UPS</MenuItem>
                  <MenuItem value="cctv">CCTV</MenuItem>
                  <MenuItem value="Keyboard">Keyboard</MenuItem>
                  <MenuItem value="Mouse">Mouse</MenuItem>
                  <MenuItem value="PowerSupply">Power Supply</MenuItem>
                  <MenuItem value="Motherboard">Motherboard</MenuItem>
                  <MenuItem value="HardDisk">Hard Disk</MenuItem>
                  <MenuItem value="Display">Display</MenuItem>
                  <MenuItem value="RAM">RAM</MenuItem>
                  <MenuItem value="CPUFan">CPU Fan</MenuItem>
                  <MenuItem value="Processor">Processor</MenuItem>
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
                  select
                  label="Part Status"
                  name="partStatus"
                  value={formik.values.partStatus}
                  onChange={formik.handleChange}
                  required
                >
                  <MenuItem value="working">Working</MenuItem>
                  <MenuItem value="faulty">Faulty</MenuItem>
                </TextField>
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

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>More Fields required for this stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                name="serialNumber"
                label="Serial Number"
                value={formik2.values.serialNumber}
                onChange={formik2.handleChange}
              />
              <TextField
                fullWidth
                name="modelNumber"
                label="Model"
                value={formik2.values.modelNumber}
                onChange={formik2.handleChange}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={formik2.handleSubmit}
            disabled={loading}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EngineerToBranch;


