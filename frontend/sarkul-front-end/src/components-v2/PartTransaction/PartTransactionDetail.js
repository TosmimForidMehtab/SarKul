import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Button
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, ArrowForward, Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportToCSV';
import { formatDate } from '../../utils/formatDate';

const PartTransactionDetail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [dispatchMode, setDispatchMode] = useState('');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/transaction', {
    search: debouncedSearch,
    category: category || undefined,
    dispatchMode: dispatchMode || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }
    const csvData = data.map(tx => ({
      'Date': tx.createdAt ? formatDate(tx.createdAt) : '',
      'Transaction Type': tx.category === 'b2e' ? 'Branch to Engineer (B2E)' : 'Engineer to Branch (E2B)',
      'Call ID': tx.callId || '',
      'Group': tx.partName || tx.itemName || '',
      'Item Name': tx.itemName || '',
      'Part Name': tx.partName || '',
      'Stock ID': tx.stockId || '',
      'Engineer Name': tx.engineerName || '',
      'Model Number': tx.modelNumber || '',
      'Serial Number': tx.serialNumber || '',
      'Dispatch Mode': tx.dispatchMode || '',
      'Part Status': tx.partStatus || ''
    }));
    exportToCSV(csvData, 'Part_Transaction_Report.csv');
  };

  return (
    <Box>
      <PageHeader title="Transaction Details" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by Call ID, Engineer, Stock ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">Filters:</Typography>
                </Box>
                
                <TextField
                  select
                  size="small"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ minWidth: 120 }}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="b2e">B2E (Branch → Engineer)</MenuItem>
                  <MenuItem value="e2b">E2B (Engineer → Branch)</MenuItem>
                </TextField>

                <TextField
                  select
                  size="small"
                  value={dispatchMode}
                  onChange={(e) => setDispatchMode(e.target.value)}
                  sx={{ minWidth: 140 }}
                  label="Dispatch Mode"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="RGP">RGP</MenuItem>
                  <MenuItem value="NRGP">NRGP</MenuItem>
                  <MenuItem value="consumable">Consumable</MenuItem>
                </TextField>

                <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={handleDownloadCSV}>
                  CSV
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {data.map((transaction, index) => {
          const isB2E = transaction.category === 'b2e';
          const isLastElement = index === data.length - 1;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={transaction._id} ref={isLastElement ? lastElementRef : null}>
              <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <StatusBadge 
                      status={isB2E ? 'B2E' : 'E2B'} 
                      color={isB2E ? 'primary' : 'secondary'} 
                    />
                  </Box>

                  <Box display="flex" alignItems="center" justifyContent="center" mb={2} p={1} bgcolor="action.hover" borderRadius={1}>
                    <Typography variant="subtitle2" color="text.primary">
                      {isB2E ? 'Branch' : transaction.engineerName}
                    </Typography>
                    <Box mx={2}>
                      <ArrowForward color={isB2E ? "primary" : "secondary"} />
                    </Box>
                    <Typography variant="subtitle2" color="text.primary">
                      {isB2E ? transaction.engineerName : 'Branch'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" gutterBottom>
                    <strong>Call ID:</strong> {transaction.callId}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Stock ID:</strong> {transaction.stockId}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
                    <strong>Group / Part:</strong> {transaction.partName || transaction.itemName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Item Name:</strong> {transaction.itemName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Model Number:</strong> {transaction.modelNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Serial Number:</strong> {transaction.serialNumber || 'N/A'}
                  </Typography>
                  {transaction.dispatchMode && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Dispatch:</strong> {transaction.dispatchMode}
                    </Typography>
                  )}
                  {transaction.partStatus && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Part Status:</strong> {transaction.partStatus}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
        
        {loading && (
          <>
            <Grid item xs={12} md={6} lg={4}><CardSkeleton count={1} /></Grid>
            <Grid item xs={12} md={6} lg={4}><CardSkeleton count={1} /></Grid>
            <Grid item xs={12} md={6} lg={4}><CardSkeleton count={1} /></Grid>
          </>
        )}
      </Grid>

      {!loading && data.length === 0 && (
        <EmptyState 
          title="No Transactions Found" 
          description="We couldn't find any part transactions matching your criteria."
        />
      )}
    </Box>
  );
};

export default PartTransactionDetail;
