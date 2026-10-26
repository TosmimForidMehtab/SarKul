import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
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

const AllStock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [condition, setCondition] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [scrapFilter, setScrapFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/stock', {
    search: debouncedSearch,
    condition: condition || undefined,
    itemName: itemCategory || undefined,
    scrap: scrapFilter || undefined,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Fetching full stock report for download...');
      const res = await api.get('/stock', {
        params: {
          search: debouncedSearch || undefined,
          condition: condition || undefined,
          itemName: itemCategory || undefined,
          scrap: scrapFilter || undefined,
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
          limit: 'all',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });

      let rawData = res.data?.data?.data || res.data?.data || res.data?.stocks || [];
      if (!Array.isArray(rawData) && res.data?.message?.[0]?.data) {
        rawData = res.data.message[0].data;
      }
      if (!Array.isArray(rawData) || rawData.length === 0) {
        rawData = data;
      }

      if (!rawData || rawData.length === 0) {
        toast.error('No stock data to download for selected filters');
        return;
      }

      const csvData = rawData.map(item => ({
        'Date': item.createdAt ? formatDate(item.createdAt) : '',
        'Stock Id': item.stockId || '',
        'Item Name': item.itemName || '',
        'Group': item.itemPart || item.group || item.groupName || '',
        'Configuration': item.configuration || '',
        'Condition': item.condition || '',
        'Model Number': item.modelNumber || '',
        'Serial Number': item.serialNumber || '',
        'Price': item.price !== undefined && item.price !== null ? `Rs ${item.price}` : '',
        'Status': item.status || 'available',
        'Office Repair': item.officeRepair || 'no',
        'Scrap': item.scrap || 'no',
        'AMC Start Date': item.amcStartDate ? formatDate(item.amcStartDate) : '',
        'AMC End Date': item.amcEndDate ? formatDate(item.amcEndDate) : ''
      }));

      exportToCSV(csvData, 'All_Stock.csv');
      toast.success(`Downloaded ${csvData.length} stock records!`);
    } catch (err) {
      if (data && data.length > 0) {
        const csvData = data.map(item => ({
          'Date': item.createdAt ? formatDate(item.createdAt) : '',
          'Stock Id': item.stockId || '',
          'Item Name': item.itemName || '',
          'Group': item.itemPart || item.group || item.groupName || '',
          'Configuration': item.configuration || '',
          'Condition': item.condition || '',
          'Model Number': item.modelNumber || '',
          'Serial Number': item.serialNumber || '',
          'Price': item.price !== undefined && item.price !== null ? `Rs ${item.price}` : '',
          'Status': item.status || 'available',
          'Office Repair': item.officeRepair || 'no',
          'Scrap': item.scrap || 'no',
          'AMC Start Date': item.amcStartDate ? formatDate(item.amcStartDate) : '',
          'AMC End Date': item.amcEndDate ? formatDate(item.amcEndDate) : ''
        }));
        exportToCSV(csvData, 'All_Stock.csv');
        toast.success(`Downloaded ${csvData.length} loaded records!`);
      } else {
        toast.error('Failed to export stock report');
      }
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => { if (error) toast.error(error); }, [error]);

  return (
    <Box>
      <PageHeader title="All Stock" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={1.5}>
              <TextField select fullWidth label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} size="small">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="working">Working</MenuItem>
                <MenuItem value="faulty">Faulty</MenuItem>
                <MenuItem value="new">New</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField select fullWidth label="Item Category" value={itemCategory} onChange={(e) => setItemCategory(e.target.value)} size="small">
                <MenuItem value="">All Items</MenuItem>
                <MenuItem value="printer">Printer</MenuItem>
                <MenuItem value="scanner">Scanner</MenuItem>
                <MenuItem value="plotter">Plotter</MenuItem>
                <MenuItem value="desktop">Desktop</MenuItem>
                <MenuItem value="laptop">Laptop</MenuItem>
                <MenuItem value="server">Server</MenuItem>
                <MenuItem value="UPS">UPS</MenuItem>
                <MenuItem value="cctv">CCTV</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={1.5}>
              <TextField select fullWidth label="Scrap" value={scrapFilter} onChange={(e) => setScrapFilter(e.target.value)} size="small">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Scrap Only</MenuItem>
                <MenuItem value="no">Exclude Scrap</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={1.5}>
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
            <Grid item xs={6} md={1.5}>
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
            <Grid item xs={6} md={1.5}>
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
          const groupName = stock.itemPart || stock.group || stock.groupName || '';
          return (
            <Grid item xs={12} sm={6} md={4} key={stock.stockId || stock._id || index} ref={isLast ? lastElementRef : null}>
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
                      {stock.stockId}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {stock.scrap === 'yes' && <StatusBadge status="scrap" />}
                      <StatusBadge status={stock.condition} />
                    </Stack>
                  </Stack>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {stock.itemName}
                  </Typography>
                  {groupName && (
                    <Typography variant="body2" color="text.secondary">
                      Group: {groupName}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Serial: {stock.serialNumber}
                  </Typography>
                  {stock.createdAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Date: {formatDate(stock.createdAt)}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} mt={2}>
                    <Chip label={`₹${stock.price}`} size="small" color="success" variant="outlined" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {loading && <Box mt={3}><CardSkeleton count={3} /></Box>}
      
      {!loading && data.length === 0 && (
        <EmptyState title="No stocks found" description="Try adjusting your filters or date range." />
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
                Stock Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <StatusBadge status={selectedStock.condition} />
                {selectedStock.scrap === 'yes' && <StatusBadge status="scrap" />}
                {selectedStock.officeRepair === 'yes' && <StatusBadge status="maintenance" />}
              </Box>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Stock ID</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedStock.stockId}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Item Name</Typography>
                  <Typography variant="body1">{selectedStock.itemName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Group (Item Part)</Typography>
                  <Typography variant="body1">{selectedStock.itemPart || selectedStock.group || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body1">{selectedStock.serialNumber || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Configuration</Typography>
                  <Typography variant="body1">{selectedStock.configuration || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Model</Typography>
                  <Typography variant="body1">{selectedStock.modelNumber || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Price</Typography>
                  <Typography variant="body1">₹{selectedStock.price}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">AMC / Warranty Dates</Typography>
                  <Typography variant="body2">
                    {formatDate(selectedStock.amcStartDate)} to {formatDate(selectedStock.amcEndDate)}
                  </Typography>
                </Box>
              </Stack>
              <Button fullWidth variant="outlined" sx={{ mt: 4 }} onClick={() => setSelectedStock(null)}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default AllStock;
