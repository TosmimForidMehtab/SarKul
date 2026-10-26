import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Button
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportToCSV';
import { formatDate } from '../../utils/formatDate';

const CallRegister = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/call', {
    search: debouncedSearch,
    status: status || undefined,
    category: category || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }
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
        'Status': call.status || '',
        'Category': call.category || '',
        'Group': call.itemName || call.group || call.groupName || '',
        'Item Model Number': call.itemModelNumber || '',
        'Customer Remark': call.customerRemark || '',
        'Engineer Remark': call.engineerRemark || '',
        'Part Status': call.itemStatus || '',
        'Closed Date': call.closedAt ? formatDate(call.closedAt) : (call.status === 'completed' && call.updatedAt ? formatDate(call.updatedAt) : '')
      };
    });
    exportToCSV(csvData, 'Call_Register.csv');
  };

  useEffect(() => { if (error) toast.error(error); }, [error]);

  return (
    <Box>
      <PageHeader title="Call Register" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Status" value={status} onChange={(e) => setStatus(e.target.value)} size="small">
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="oemPending">OEM Pending</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={2}>
              <Stack direction="row" justifyContent="flex-end">
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
          const groupName = call.itemName || call.group || call.groupName || '';
          return (
            <Grid item xs={12} sm={6} md={4} key={call.callId || call._id} ref={isLast ? lastElementRef : null}>
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
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {loading && <Box mt={3}><CardSkeleton count={3} /></Box>}
      
      {!loading && data.length === 0 && (
        <EmptyState title="No calls found" description="Try adjusting your filters or search term." />
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
