import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Grid, InputAdornment, Stack, Drawer, Button, Chip, CircularProgress
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

const BranchStockList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/mystocks', {
    search: debouncedSearch,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Fetching full branch stock report for download...');
      const res = await api.get('/mystocks', {
        params: {
          search: debouncedSearch || undefined,
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
        toast.error('No branch stock to download for selected filters');
        return;
      }

      const csvData = rawData.map(stock => ({
        'Date': stock.createdAt ? formatDate(stock.createdAt) : '',
        'Item Name': stock.itemName || '',
        'Group': stock.brand || stock.itemName || '',
        'Brand': stock.brand || '',
        'Serial Number': stock.serialNumber || '',
        'Price': stock.price != null ? 'Rs ' + stock.price : '',
        'Warranty Start': stock.warrantyStart ? formatDate(stock.warrantyStart) : '',
        'Warranty End': stock.warrantyEnd ? formatDate(stock.warrantyEnd) : ''
      }));

      exportToCSV(csvData, 'Branch_Stock_Report.csv');
      toast.success(`Downloaded ${csvData.length} records!`);
    } catch (err) {
      if (data && data.length > 0) {
        const csvData = data.map(stock => ({
          'Date': stock.createdAt ? formatDate(stock.createdAt) : '',
          'Item Name': stock.itemName || '',
          'Group': stock.brand || stock.itemName || '',
          'Brand': stock.brand || '',
          'Serial Number': stock.serialNumber || '',
          'Price': stock.price != null ? 'Rs ' + stock.price : '',
          'Warranty Start': stock.warrantyStart ? formatDate(stock.warrantyStart) : '',
          'Warranty End': stock.warrantyEnd ? formatDate(stock.warrantyEnd) : ''
        }));
        exportToCSV(csvData, 'Branch_Stock_Report.csv');
        toast.success(`Downloaded ${csvData.length} loaded records!`);
      } else {
        toast.error('Failed to export branch stock report');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Branch Stock" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search branch stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={3}>
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
            <Grid item xs={6} md={3}>
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

      <Grid container spacing={2}>
        {data.map((stock, index) => {
          const isLast = data.length === index + 1;
          return (
            <Grid item xs={12} sm={6} md={4} key={stock._id || index} ref={isLast ? lastElementRef : null}>
              <Card 
                onClick={() => setSelectedStock(stock)}
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: '0.3s', 
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {stock.itemName}
                    </Typography>
                    <StatusBadge status="available" />
                  </Stack>
                  <Typography variant="body2" color="primary" fontWeight="medium" gutterBottom>
                    Group: {stock.brand || stock.itemName || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Brand: {stock.brand}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Serial: {stock.serialNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Price: ₹{stock.price}
                  </Typography>
                  {stock.createdAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Date: {formatDate(stock.createdAt)}
                    </Typography>
                  )}
                  {stock.warrantyStart && stock.warrantyEnd && (
                    <Typography variant="body2" color="text.secondary">
                      Warranty: {formatDate(stock.warrantyStart)} to {formatDate(stock.warrantyEnd)}
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
        <EmptyState title="No branch stocks found" description="Try adjusting your filters or date range." />
      )}
      
      {!loading && !hasMore && data.length > 0 && (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">End of results</Typography>
        </Box>
      )}

      {/* Details Drawer */}
      <Drawer anchor="right" open={Boolean(selectedStock)} onClose={() => setSelectedStock(null)}>
        <Box sx={{ width: 400, p: 3 }}>
          {selectedStock && (
            <>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Branch Stock Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <StatusBadge status="available" />
                <Chip label={`₹${selectedStock.price}`} color="success" variant="outlined" size="small" />
              </Box>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Item Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedStock.itemName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Group</Typography>
                  <Typography variant="body1">{selectedStock.brand || selectedStock.itemName || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Brand</Typography>
                  <Typography variant="body1">{selectedStock.brand}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body1">{selectedStock.serialNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Warranty Start</Typography>
                  <Typography variant="body1">{selectedStock.warrantyStart ? formatDate(selectedStock.warrantyStart) : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Warranty End</Typography>
                  <Typography variant="body1">{selectedStock.warrantyEnd ? formatDate(selectedStock.warrantyEnd) : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Added On</Typography>
                  <Typography variant="body1">{selectedStock.createdAt ? formatDate(selectedStock.createdAt) : 'N/A'}</Typography>
                </Box>
              </Stack>
              
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mt: 4 }}
                onClick={() => setSelectedStock(null)}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default BranchStockList;
