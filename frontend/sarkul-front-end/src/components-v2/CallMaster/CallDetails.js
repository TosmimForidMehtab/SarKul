import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Grid, Autocomplete, CircularProgress, Stack, Divider, Chip
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import api from '../../services/api';

const CallDetails = () => {
  const [callOptions, setCallOptions] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [callDetails, setCallDetails] = useState(null);
  const [callsLoading, setCallsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCalls = async (query) => {
    if (!query) return;
    setCallsLoading(true);
    try {
      const res = await api.get(`/call/lookup?search=${query}`);
      let calls = res.data.data || res.data;
      if (calls && !Array.isArray(calls) && Array.isArray(calls.data)) calls = calls.data;
      if (!Array.isArray(calls)) calls = [];
      setCallOptions(calls);
    } catch (err) {
      console.error(err);
    } finally {
      setCallsLoading(false);
    }
  };

  const fetchCallDetails = async (callId) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/call/${callId}`);
      setCallDetails(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to fetch call details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCallSelect = (newValue) => {
    setSelectedCall(newValue);
    if (newValue) {
      fetchCallDetails(newValue.callId);
    } else {
      setCallDetails(null);
    }
  };

  return (
    <Box>
      <PageHeader title="Call Details" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Autocomplete
            options={callOptions}
            getOptionLabel={(option) => `${option.callId} - ${option.customerName}`}
            onInputChange={(e, value) => fetchCalls(value)}
            onChange={(e, newValue) => handleCallSelect(newValue)}
            value={selectedCall}
            loading={callsLoading}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search Call Number" 
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {callsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      {detailsLoading && <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>}

      {!detailsLoading && callDetails && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h5" color="primary">
                    Call #{callDetails.callId}
                  </Typography>
                  <StatusBadge status={callDetails.status} />
                </Stack>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Customer Name</Typography>
                    <Typography variant="body1">{callDetails.customerName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Contact Number</Typography>
                    <Typography variant="body1">{callDetails.contactNumber}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1">{callDetails.address || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                    <Chip label={callDetails.category} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                    <Chip label={callDetails.priority || 'Medium'} size="small" color={callDetails.priority === 'high' ? 'error' : 'default'} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Problem Description</Typography>
                    <Typography variant="body2">{callDetails.problemDescription || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                    <Typography variant="body2">{callDetails.remarks || 'No remarks provided.'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>Assigned Engineer</Typography>
                <Divider sx={{ mb: 2 }} />
                {callDetails.assignedEngineer ? (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" gutterBottom>{callDetails.assignedEngineer.name}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Code</Typography>
                    <Typography variant="body1">{callDetails.assignedEngineer.code}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No engineer has been assigned to this call yet.
                  </Typography>
                )}
                
                <Box mt={4}>
                  <Typography variant="h6" color="primary" gutterBottom>Timeline</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Created On</Typography>
                      <Typography variant="body2">{new Date(callDetails.createdAt).toLocaleString()}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Last Updated</Typography>
                      <Typography variant="body2">{new Date(callDetails.updatedAt).toLocaleString()}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CallDetails;
