import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Button, CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon, Clear as ClearIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportToCSV';
import { formatDate } from '../../utils/formatDate';
import api from '../../services/api';

const formatAction = (call) => {
  if (call.action) {
    const actionMap = {
      'serviceAndClose': 'Service and Close',
      'cancelAndClose': 'Cancel and Close',
      'customerDependence': 'Customer Dependence',
      'oemPending': 'OEM Pending',
      'replace': 'Part Replace',
      'required': 'Part Required',
      'pending': 'Part Pending',
      'chargeable': 'Chargeable'
    };
    return actionMap[call.action] || call.action;
  }
  if (call.itemStatus) {
    const actionMap = {
      'serviceAndClose': 'Service and Close',
      'cancelAndClose': 'Cancel and Close',
      'customerDependence': 'Customer Dependence',
      'oemPending': 'OEM Pending',
      'replace': 'Part Replace',
      'required': 'Part Required',
      'pending': 'Part Pending',
      'chargeable': 'Chargeable'
    };
    return actionMap[call.itemStatus] || call.itemStatus;
  }
  return call.status === 'completed' ? 'Closed' : (call.status || 'Pending');
};

const getCloseDate = (call) => {
  if (call.closedAt) return formatDate(call.closedAt);
  if (call.status === 'completed' && call.updatedAt) return formatDate(call.updatedAt);
  return 'Pending';
};

const CallRegister = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/call', {
    search: debouncedSearch,
    status: status || undefined,
    category: category || undefined,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const mapCallToRow = (call) => {
    const engineer = (Array.isArray(call.engineersAssigned) && call.engineersAssigned.length > 0)
      ? call.engineersAssigned.map(e => typeof e === 'object' ? (e.engineerName || e.employeeName || '') : e).filter(Boolean).join(', ')
      : (call.engineerName || '');

    const actionText = formatAction(call);
    const closeDateText = getCloseDate(call);
    const callLogText = call.problemDescription || call.customerRemark || '';

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
      'Call Log': callLogText,
      'Call Log Date': call.createdAt ? formatDate(call.createdAt) : '',
      'Engineers Assigned': engineer,
      'Serial Number': call.serialNumber || '',
      'Status': call.status || '',
      'Category': call.category || '',
      'Group': call.itemName || call.group || call.groupName || '',
      'Item Model Number': call.itemModelNumber || '',
      'Action': actionText,
      'Part Status': call.itemStatus || '',
      'Customer Remark': call.customerRemark || '',
      'Engineer Remark': call.engineerRemark || '',
      'Close Date': closeDateText,
      'Closed Date': closeDateText
    };
  };

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Fetching full report for download...');
      const res = await api.get('/call', {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          category: category || undefined,
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
        toast.error('No data to download for selected filters');
        return;
      }

      const csvData = rawData.map(mapCallToRow);
      exportToCSV(csvData, 'Call_Register.csv');
      toast.success(`Downloaded ${csvData.length} records successfully!`);
    } catch (err) {
      if (data && data.length > 0) {
        const csvData = data.map(mapCallToRow);
        exportToCSV(csvData, 'Call_Register.csv');
        toast.success(`Downloaded ${csvData.length} loaded records!`);
      } else {
        toast.error('Failed to export report');
      }
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => { if (error) toast.error(error); }, [error]);

  return (
    <Box>
      <PageHeader title="Call Register" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search calls by number, customer, etc."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField select fullWidth label="Status" value={status} onChange={(e) => setStatus(e.target.value)} size="small">
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="oemPending">OEM Pending</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField select fullWidth label="Category" value={category} onChange={(e) => setCategory(e.target.value)} size="small">
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
            <Grid item xs={12} md={1}>
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
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {call.callId || call.callNumber}
                    </Typography>
                    <StatusBadge status={call.status} />
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
                  <Typography variant="body2" color="secondary.main" fontWeight="medium" gutterBottom>
                    Action: {formatAction(call)}
                  </Typography>
                  {call.createdAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Call Log Date: {formatDate(call.createdAt)}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block">
                    Close Date: {getCloseDate(call)}
                  </Typography>
                  {call.problemDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, p: 0.7, bgcolor: 'action.hover', borderRadius: 1 }} noWrap>
                      Log: {call.problemDescription}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {loading && <Box mt={3}><CardSkeleton count={3} /></Box>}
      
      {!loading && data.length === 0 && (
        <EmptyState title="No calls found" description="Try adjusting your filters or date range." />
      )}
      
      {!loading && !hasMore && data.length > 0 && (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">End of results</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CallRegister;
