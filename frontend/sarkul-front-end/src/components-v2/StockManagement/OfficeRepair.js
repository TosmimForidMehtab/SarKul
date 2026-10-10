import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Grid, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';

const OfficeRepair = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [dialogState, setDialogState] = useState({
    open: false,
    scrap: false,
    stockId: '',
    repairAmount: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/stock', {
    search: debouncedSearch,
    officeRepair: 'yes',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleCloseDialog = () => {
    setDialogState({ open: false, scrap: false, stockId: '', repairAmount: '' });
  };

  const handleAction = async () => {
    setSubmitting(true);
    let payload = {};
    if (dialogState.scrap) {
      payload = { scrap: 'yes', officeRepair: 'no' };
    } else {
      payload = { 
        status: 'available', 
        officeRepair: 'no', 
        condition: 'repaired', 
        price: dialogState.repairAmount 
      };
    }

    try {
      const response = await api.patch(`/stock/${dialogState.stockId}`, payload);
      toast.success(response.data.message || 'Action completed successfully');
      // In a real app we'd mutate SWR or useInfiniteScroll cache, but here we just reload the page or filter the array
      window.location.reload(); 
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
      handleCloseDialog();
    }
  };

  return (
    <Box>
      <PageHeader title="Office Repair" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search office repair stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
            size="small"
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {data.map((stock, index) => {
          const isLast = data.length === index + 1;
          return (
            <Grid item xs={12} sm={6} md={4} key={stock.stockId || stock._id} ref={isLast ? lastElementRef : null}>
              <Card sx={{ 
                height: '100%', 
                transition: '0.3s', 
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } 
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {stock.itemName}
                    </Typography>
                    <StatusBadge status="maintenance" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Stock ID: {stock.stockId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Part: {stock.itemPart}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Serial: {stock.serialNumber}
                  </Typography>
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small" 
                      fullWidth
                      onClick={() => setDialogState({ open: true, scrap: true, stockId: stock.stockId, repairAmount: '' })}
                    >
                      Scrap
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small" 
                      fullWidth
                      onClick={() => setDialogState({ open: true, scrap: false, stockId: stock.stockId, repairAmount: '' })}
                    >
                      Repair
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {loading && <Box mt={3}><CardSkeleton count={3} /></Box>}
      
      {!loading && data.length === 0 && (
        <EmptyState title="No items for repair" description="All good!" />
      )}
      
      {!loading && !hasMore && data.length > 0 && (
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">End of results</Typography>
        </Box>
      )}

      {/* Action Dialog */}
      <Dialog open={dialogState.open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{dialogState.scrap ? 'Confirm Scrap' : 'Repair Details'}</DialogTitle>
        <DialogContent>
          <Box py={2}>
            {dialogState.scrap ? (
              <Typography>Are you sure you want to move this item to scrap?</Typography>
            ) : (
              <TextField 
                fullWidth 
                label="Repair Amount (₹)" 
                type="number" 
                value={dialogState.repairAmount}
                onChange={(e) => setDialogState({ ...dialogState, repairAmount: e.target.value })}
                autoFocus
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Cancel</Button>
          <Button onClick={handleAction} variant="contained" color={dialogState.scrap ? 'error' : 'primary'} disabled={submitting}>
            {submitting ? 'Processing...' : (dialogState.scrap ? 'Yes, Scrap it' : 'Submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OfficeRepair;


