import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, Stack, Autocomplete, MenuItem, Grid, Divider
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import api from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

const CallUpdate = () => {
  const [callOptions, setCallOptions] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [partStatus, setPartStatus] = useState('');
  const [engineerRemark, setEngineerRemark] = useState('');
  const [customerRemark, setCustomerRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const res = await api.get('/call?limit=100');
        let calls = res.data.data || res.data;
        if (calls && !Array.isArray(calls) && Array.isArray(calls.data)) calls = calls.data;
        if (!Array.isArray(calls)) calls = [];
        setCallOptions(calls);

        // Preselect if callId is in URL query
        const queryParams = new URLSearchParams(location.search);
        const urlCallId = queryParams.get('callId');
        if (urlCallId) {
          const matchedCall = calls.find(c => c.callId === urlCallId || c.callNumber === urlCallId);
          if (matchedCall) {
            setSelectedCall(matchedCall);
            setEngineerRemark(matchedCall.engineerRemark || '');
            setCustomerRemark(matchedCall.problemDescription || '');
          }
        }
      } catch (err) {
        toast.error('Failed to load calls');
      }
    };
    fetchCalls();
  }, [location.search]);

  const handleCallChange = (newValue) => {
    setSelectedCall(newValue);
    if (newValue) {
      setEngineerRemark(newValue.engineerRemark || '');
      setCustomerRemark(newValue.problemDescription || '');
    } else {
      setEngineerRemark('');
      setCustomerRemark('');
    }
  };

  const handleUpdate = async (isClosing = false) => {
    if (!selectedCall || !partStatus || !engineerRemark) {
      toast.error('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const callNumber = selectedCall.callId || selectedCall.callNumber;
      await api.patch(`/call/${callNumber}`, { 
        partStatus: partStatus,
        action: partStatus,
        engineerRemark: engineerRemark,
        customerRemark: customerRemark
      });

      if (isClosing) {
        await api.post(`/call/close/${callNumber}`);
        toast.success('Call Updated and Closed successfully!');
      } else {
        toast.success('Call updated successfully!');
      }

      setSelectedCall(null);
      setPartStatus('');
      setEngineerRemark('');
      setCustomerRemark('');
      navigate('/v2/call-master');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Call Update" />
      
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">Search & Select Call</Typography>
          <Autocomplete
            options={callOptions}
            getOptionLabel={(option) => `${option.callId || option.callNumber} - ${option.customerName}`}
            onChange={(e, newValue) => handleCallChange(newValue)}
            value={selectedCall}
            renderInput={(params) => <TextField {...params} label="Search Call Number" size="small" />}
            sx={{ mb: 4 }}
          />

          {selectedCall && (
            <>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Call Details</Typography>
                  <Stack spacing={2} sx={{ bgcolor: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2"><strong>Call Number:</strong> {selectedCall.callId || selectedCall.callNumber}</Typography>
                    <Typography variant="body2"><strong>Serial Number:</strong> {selectedCall.serialNumber}</Typography>
                    <Typography variant="body2"><strong>Customer Name:</strong> {selectedCall.customerName}</Typography>
                    <Typography variant="body2"><strong>Customer Code:</strong> {selectedCall.customerCode}</Typography>
                    <Typography variant="body2"><strong>Contact:</strong> {selectedCall.contactNumber}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedCall.customerEmail}</Typography>
                    <Typography variant="body2"><strong>Category:</strong> {selectedCall.category}</Typography>
                    <Typography variant="body2"><strong>Model Number:</strong> {selectedCall.itemModelNumber}</Typography>
                    <Typography variant="body2"><strong>Group:</strong> {selectedCall.itemName}</Typography>
                    <Typography variant="body2"><strong>Address:</strong> {selectedCall.customerAddress}</Typography>
                    <Typography variant="body2"><strong>Problem:</strong> {selectedCall.problemDescription}</Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Update Form</Typography>
                  <Stack spacing={3}>
                    <TextField 
                      label="Customer's remarks" 
                      multiline rows={2} 
                      value={customerRemark} 
                      disabled 
                      size="small"
                    />
                    
                    <TextField 
                      label="Engineer's remarks" 
                      multiline rows={3} 
                      value={engineerRemark} 
                      onChange={(e) => setEngineerRemark(e.target.value)} 
                      required 
                      size="small"
                    />

                    <TextField select label="Part Status" value={partStatus} onChange={(e) => setPartStatus(e.target.value)} required size="small">
                      <MenuItem value="">-- Select --</MenuItem>
                      <MenuItem value="required">Part Required</MenuItem>
                      <MenuItem value="pending">Part Pending</MenuItem>
                      <MenuItem value="replace">Part Replace</MenuItem>
                      <MenuItem value="chargeable">Chargeable</MenuItem>
                      <MenuItem value="serviceAndClose">Service and Close</MenuItem>
                      <MenuItem value="cancelAndClose">Cancel and Close</MenuItem>
                      <MenuItem value="customerDependence">Customer dependence</MenuItem>
                      <MenuItem value="oemPending">OEM Pending</MenuItem>
                    </TextField>

                    <Stack direction="row" spacing={2} pt={2}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleUpdate(false)} 
                        disabled={loading || !partStatus || !engineerRemark}
                        fullWidth
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </Button>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => handleUpdate(true)} 
                        disabled={loading || !partStatus || !engineerRemark}
                        fullWidth
                      >
                        Call Close
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CallUpdate;
