import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Button, CircularProgress
} from '@mui/material';
import { Search as SearchIcon, ArrowForward, Download as DownloadIcon, Clear as ClearIcon } from '@mui/icons-material';
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

const PartTransactionDetail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [dispatchMode, setDispatchMode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/transaction', {
    search: debouncedSearch,
    category: category || undefined,
    dispatchMode: dispatchMode || undefined,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Fetching full transaction report for download...');
      const res = await api.get('/transaction', {
        params: {
          search: debouncedSearch || undefined,
          category: category || undefined,
          dispatchMode: dispatchMode || undefined,
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
          limit: 'all',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      let rawData = res.data?.data?.data || res.data?.data || [];
      if (!Array.isArray(rawData) && res.data?.message?.[0]?.data) {
        rawData = res.data.message[0].data;
      }
      if (!Array.isArray(rawData) || rawData.length === 0) {
        rawData = data;
      }

      if (!rawData || rawData.length === 0) {
        toast.error('No transactions to download for selected filters');
        return;
      }

      const csvData = rawData.map(tx => ({
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
      toast.success(`Downloaded ${csvData.length} transaction records!`);
    } catch (err) {
      if (data && data.length > 0) {
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
        toast.success(`Downloaded ${csvData.length} loaded records!`);
      } else {
        toast.error('Failed to export transaction report');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Transaction Details" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
            
            <Grid item xs={6} md={1.5}>
              <TextField
                select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="b2e">B2E</MenuItem>
                <MenuItem value="e2b">E2B</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6} md={1.5}>
              <TextField
                select
                fullWidth
                size="small"
                value={dispatchMode}
                onChange={(e) => setDispatchMode(e.target.value)}
                label="Dispatch"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="RGP">RGP</MenuItem>
                <MenuItem value="NRGP">NRGP</MenuItem>
                <MenuItem value="consumable">Consumable</MenuItem>
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

            <Grid item xs={12} md={2}>
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

      <Grid container spacing={3}>
        {data.map((transaction, index) => {
          const isB2E = transaction.category === 'b2e';
          const isLastElement = index === data.length - 1;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={transaction._id || index} ref={isLastElement ? lastElementRef : null}>
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
                  {transaction.createdAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Date: {formatDate(transaction.createdAt)}
                    </Typography>
                  )}
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
      </Grid>

      {loading && (
        <>
          <Grid item xs={12} md={6} lg={4}><CardSkeleton count={1} /></Grid>
          <Grid item xs={12} md={6} lg={4}><CardSkeleton count={1} /></Grid>
          <Grid item xs={12} md={6} lg={4}><CardSkeleton count={1} /></Grid>
        </>
      )}

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
