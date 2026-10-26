import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Grid, InputAdornment, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Autocomplete, MenuItem, CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon, Clear as ClearIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';
import { exportToCSV } from '../../utils/exportToCSV';
import { formatDate } from '../../utils/formatDate';

const PendingCalls = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
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
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Fetching full pending report for download...');
      const res = await api.get('/call/pending', {
        params: {
          search: debouncedSearch || undefined,
          category: categoryFilter || undefined,
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
          limit: 'all',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      let rawData = res.data?.data?.data || res.data?.data || res.data?.calls || [];
      if (!Array.isArray(rawData) && res.data?.message?.[0]?.data) {
        rawData = res.data.message[0].data;
      }
      if (!Array.isArray(rawData) || rawData.length === 0) {
        rawData = data;
      }

      if (!rawData || rawData.length === 0) {
        toast.error('No pending calls to download for selected filters');
        return;
      }

      const csvData = rawData.map(call => {
        const engineer = (Array.isArray(call.engineersAssigned) && call.engineersAssigned.length > 0)
          ? call.engineersAssigned.map(e => typeof e === 'object' ? (e.engineerName || e.employeeName || '') : e).filter(Boolean).join(', ')
          : (call.engineerName || '');

        return {
          'Date': call.createdAt ? formatDate(call.createdAt) : '',
          'Call Id': call.callId || call.callNumber || '',
          'Customer Name': call.customerName || '',
          'Customer Code': call.customerCode || '',
          'User Name': call.userName || '',
          'Contact Number': call.contactNumber || '',
          'Customer Email': call.customerEmail || '',
          'Customer Address': call.customerAddress || '',
          'Problem Description': call.problemDescription || '',
          'Engineers Assigned': engineer,
          'Serial Number': call.serialNumber || '',
          'Status': call.status || 'pending',
          'Category': call.category || '',
          'Group': call.itemName || call.group || call.groupName || '',
          'Item Model Number': call.itemModelNumber || '',
          'Customer Remark': call.customerRemark || '',
          'Engineer Remark': call.engineerRemark || '',
          'Part Status': call.itemStatus || ''
        };
      });

      exportToCSV(csvData, 'Pending_Calls.csv');
      toast.success(`Downloaded ${csvData.length} pending calls!`);
    } catch (err) {
      if (data && data.length > 0) {
        const csvData = data.map(call => {
          const engineer = (Array.isArray(call.engineersAssigned) && call.engineersAssigned.length > 0)
            ? call.engineersAssigned.map(e => typeof e === 'object' ? (e.engineerName || e.employeeName || '') : e).filter(Boolean).join(', ')
            : (call.engineerName || '');

          return {
            'Date': call.createdAt ? formatDate(call.createdAt) : '',
            'Call Id': call.callId || call.callNumber || '',
            'Customer Name': call.customerName || '',
            'Customer Code': call.customerCode || '',
            'User Name': call.userName || '',
            'Contact Number': call.contactNumber || '',
            'Customer Email': call.customerEmail || '',
            'Customer Address': call.customerAddress || '',
            'Problem Description': call.problemDescription || '',
            'Engineers Assigned': engineer,
            'Serial Number': call.serialNumber || '',
            'Status': call.status || 'pending',
            'Category': call.category || '',
            'Group': call.itemName || call.group || call.groupName || '',
            'Item Model Number': call.itemModelNumber || '',
            'Customer Remark': call.customerRemark || '',
            'Engineer Remark': call.engineerRemark || '',
            'Part Status': call.itemStatus || ''
          };
        });
        exportToCSV(csvData, 'Pending_Calls.csv');
        toast.success(`Downloaded ${csvData.length} loaded records!`);
      } else {
        toast.error('Failed to export pending calls');
      }
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const res = await api.get('/engineer?status=active&limit=1000');
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
        engineerName: selectedEngineer.employeeName,
        engineerCode: selectedEngineer.employeeCode
      });
      toast.success('Call assigned successfully');
      setAssignModalOpen(false);
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
      await api.post('/call/update', {
        callId: selectedCall.callId || selectedCall.callNumber,
        itemStatus: partStatus,
        engineerRemark,
        customerRemark: selectedCall.customerRemark || selectedCall.problemDescription || '',
        status: isClosing ? 'completed' : 'pending'
      });
      toast.success(isClosing ? 'Call completed and closed successfully' : 'Call updated successfully');
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
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} size="small">
                <MenuItem value="">All Categories</MenuItem>
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
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                {(fromDate || toDate) && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => { setFromDate(''); setToDate(''); }}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                    title="Clear Dates"
                  >
                    <ClearIcon fontSize="small" />
                  </Button>
                )}
                <Button 
                  variant="outlined" 
                  startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />} 
                  size="small" 
                  onClick={handleDownloadCSV}
                  disabled={isExporting}
                >
                  CSV
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {data.map((call, index) => {
          const isLast = data.length === index + 1;
          const groupName = call.itemName || call.group || call.groupName || '';
          return (
            <Grid item xs={12} sm={6} md={4} key={call.callId || call._id || index} ref={isLast ? lastElementRef : null}>
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
                  {groupName && (
                    <Typography variant="body2" color="primary" gutterBottom>
                      Group: {groupName}
                    </Typography>
                  )}
                  {call.createdAt && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Date: {formatDate(call.createdAt)}
                    </Typography>
                  )}
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
        <EmptyState title="No pending calls" description="Try adjusting your filters or date range." />
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
