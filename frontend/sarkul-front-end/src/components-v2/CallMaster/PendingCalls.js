import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Grid, InputAdornment, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete, MenuItem, IconButton
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';
import { exportToCSV } from '../../utils/exportToCSV';

const PendingCalls = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [engineers, setEngineers] = useState([]);
  
  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [partStatus, setPartStatus] = useState('');
  const [engineerRemark, setEngineerRemark] = useState('');
  const [customerRemark, setCustomerRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/call/pending', {
    search: debouncedSearch,
    category: categoryFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }
    const csvData = data.map(call => ({
      CallNumber: call.callId || call.callNumber,
      Customer: call.customerName,
      Category: call.category,
      Problem: call.problemDescription,
      CreatedOn: call.createdAt ? new Date(call.createdAt).toLocaleDateString() : ''
    }));
    exportToCSV(csvData, 'Pending_Calls.csv');
  };

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const res = await api.get('/engineer');
        let engData = res.data.data || res.data;
        if (engData && !Array.isArray(engData) && Array.isArray(engData.data)) engData = engData.data;
        setEngineers(Array.isArray(engData) ? engData : []);
      } catch (err) {
        console.error('Failed to load engineers');
      }
    };
    fetchEngineers();
  }, []);

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const openAssignModal = (call) => {
    setSelectedCall(call);
    setSelectedEngineer(null);
    setAssignModalOpen(true);
  };

  const openUpdateModal = (call) => {
    setSelectedCall(call);
    setPartStatus('');
    setEngineerRemark(call.engineerRemark || '');
    setCustomerRemark(call.problemDescription || '');
    setUpdateModalOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedEngineer) {
      toast.error('Please select an engineer');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/call/assign', {
        callId: selectedCall.callId || selectedCall.callNumber,
        engineerCode: selectedEngineer.employeeCode
      });
      toast.success('Call assigned successfully');
      setAssignModalOpen(false);
      // Reload logic could be added here, currently relies on navigation or state
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign call');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (isClosing = false) => {
    if (!partStatus || !engineerRemark) {
      toast.error('Please fill Part Status and Engineer Remark');
      return;
    }
    setSubmitting(true);
    try {
      const callNumber = selectedCall.callId || selectedCall.callNumber;
      await api.patch(`/call/${callNumber}`, {
        partStatus: partStatus,
        engineerRemark: engineerRemark,
        customerRemark: customerRemark
      });
      
      if (isClosing) {
        await api.post(`/call/close/${callNumber}`);
        toast.success('Call Updated and Closed successfully');
      } else {
        toast.success('Call updated successfully');
      }
      
      setUpdateModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update call');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Pending Calls" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search pending calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Filter Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size="small">
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="laptop">Laptop</MenuItem>
                <MenuItem value="printer">Printer</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={handleDownloadCSV}>
                  Download CSV
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {data.map((call, index) => {
          const isLast = data.length === index + 1;
          return (
            <Grid item xs={12} sm={6} md={4} key={call.callId || call._id} ref={isLast ? lastElementRef : null}>
              <Card sx={{ 
                height: '100%', 
                transition: '0.3s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                display: 'flex', flexDirection: 'column'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {call.callId || call.callNumber}
                    </Typography>
                    <StatusBadge status="pending" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Customer: {call.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category: {call.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                    {call.problemDescription?.substring(0, 50)}...
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small" color="primary" fullWidth onClick={() => openAssignModal(call)}>
                      Assign
                    </Button>
                    <Button variant="outlined" size="small" color="secondary" fullWidth onClick={() => openUpdateModal(call)}>
                      Update
                    </Button>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {loading && <Box mt={3}><CardSkeleton count={3} /></Box>}
      
      {!loading && data.length === 0 && (
        <EmptyState title="No pending calls" description="You are all caught up!" />
      )}

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onClose={() => setAssignModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Call - {selectedCall?.callId || selectedCall?.callNumber}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" mb={2} color="text.secondary">
            Select an engineer to assign to {selectedCall?.customerName}'s call.
          </Typography>
          <Autocomplete
            options={engineers}
            getOptionLabel={(option) => `${option.employeeName} (${option.employeeCode})`}
            value={selectedEngineer}
            onChange={(e, val) => setSelectedEngineer(val)}
            renderInput={(params) => <TextField {...params} label="Select Engineer" required />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={submitting}>
            {submitting ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={updateModalOpen} onClose={() => setUpdateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Call - {selectedCall?.callId || selectedCall?.callNumber}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField 
              label="Customer's Remarks (Problem Description)" 
              multiline rows={2} 
              value={customerRemark} 
              disabled
            />
            <TextField select label="Part Status" value={partStatus} onChange={(e) => setPartStatus(e.target.value)} required>
              <MenuItem value="required">Part Required</MenuItem>
              <MenuItem value="pending">Part Pending</MenuItem>
              <MenuItem value="replace">Part Replace</MenuItem>
              <MenuItem value="chargeable">Chargeable</MenuItem>
              <MenuItem value="serviceAndClose">Service and Close</MenuItem>
              <MenuItem value="cancelAndClose">Cancel and Close</MenuItem>
              <MenuItem value="customerDependence">Customer dependence</MenuItem>
              <MenuItem value="oemPending">OEM Pending</MenuItem>
            </TextField>
            <TextField 
              label="Engineer's Remarks" 
              multiline rows={3} 
              value={engineerRemark} 
              onChange={(e) => setEngineerRemark(e.target.value)} 
              required 
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => handleUpdate(false)} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update'}
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleUpdate(true)} disabled={submitting}>
            {submitting ? 'Closing...' : 'Update & Close Call'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PendingCalls;

