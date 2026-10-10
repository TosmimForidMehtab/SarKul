import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, IconButton, Stack, CircularProgress, Button
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { TableSkeleton, CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportToCSV';

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
    const csvData = data.map(call => ({
      CallNumber: call.callId || call.callNumber,
      Status: call.status,
      Customer: call.customerName,
      Category: call.category,
      Problem: call.problemDescription,
      CreatedOn: call.createdAt ? new Date(call.createdAt).toLocaleDateString() : ''
    }));
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



