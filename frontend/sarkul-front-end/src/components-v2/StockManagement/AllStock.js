import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Drawer, Button, Chip
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

const AllStock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [condition, setCondition] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [scrapFilter, setScrapFilter] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/stock', {
    search: debouncedSearch,
    condition: condition || undefined,
    itemName: itemCategory || undefined,
    scrap: scrapFilter || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }
    const csvData = data.map(item => ({
      StockId: item.stockId,
      ItemName: item.itemName,
      Group: item.itemPart,
      Configuration: item.configuration,
      Condition: item.condition,
      ModelNumber: item.modelNumber,
      SerialNumber: item.serialNumber,
      Price: `Rs ${item.price}`,
      Scrap: item.scrap,
      AMCStartDate: item.amcStartDate ? new Date(item.amcStartDate).toLocaleDateString() : '',
      AMCEndDate: item.amcEndDate ? new Date(item.amcEndDate).toLocaleDateString() : ''
    }));
    exportToCSV(csvData, 'All_Stock.csv');
  };

  useEffect(() => { if (error) toast.error(error); }, [error]);

  return (
    <Box>
      <PageHeader title="All Stock" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} size="small">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="working">Working</MenuItem>
                <MenuItem value="faulty">Faulty</MenuItem>
                <MenuItem value="new">New</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Scrap" value={scrapFilter} onChange={(e) => setScrapFilter(e.target.value)} size="small">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="yes">Scrap Only</MenuItem>
                <MenuItem value="no">Exclude Scrap</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" startIcon={<DownloadIcon />} size="small" onClick={handleDownloadCSV}>
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
            <Grid item xs={12} sm={6} md={4} key={stock.stockId || stock._id} ref={isLast ? lastElementRef : null}>
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
                  <Typography variant="body2" color="text.secondary">
                    Group: {stock.itemPart}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Serial: {stock.serialNumber}
                  </Typography>
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
        <EmptyState title="No stocks found" description="Try adjusting your filters or search term." />
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
                <Chip label={`₹${selectedStock.price}`} color="success" variant="outlined" size="small" />
              </Box>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Stock ID</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedStock.stockId}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Item Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedStock.itemName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Group (Part)</Typography>
                  <Typography variant="body1">{selectedStock.itemPart}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                  <Typography variant="body1">{selectedStock.serialNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Model Number</Typography>
                  <Typography variant="body1">{selectedStock.modelNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Configuration</Typography>
                  <Typography variant="body1">{selectedStock.configuration}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">AMC Start Date</Typography>
                  <Typography variant="body1">{selectedStock.amcStartDate ? new Date(selectedStock.amcStartDate).toLocaleDateString() : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">AMC End Date</Typography>
                  <Typography variant="body1">{selectedStock.amcEndDate ? new Date(selectedStock.amcEndDate).toLocaleDateString() : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Added On</Typography>
                  <Typography variant="body1">{selectedStock.createdAt ? new Date(selectedStock.createdAt).toLocaleDateString() : 'N/A'}</Typography>
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

export default AllStock;



