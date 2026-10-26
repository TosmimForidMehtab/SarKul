import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Chip, Button, CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Download as DownloadIcon, Clear as ClearIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportToCSV';
import { formatDate } from '../../utils/formatDate';
import api from '../../services/api';

const categories = ['Travel', 'BackEnd', 'Miscellneous', 'Courier', 'exp'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ExpenseList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [engineerName, setEngineerName] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/expense', {
    search: debouncedSearch,
    engineerName: engineerName || undefined,
    category: category || undefined,
    month: month || undefined,
    startDate: fromDate || undefined,
    endDate: toDate || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleDownloadCSV = async () => {
    try {
      setIsExporting(true);
      toast.info('Fetching full expense report for download...');
      const res = await api.get('/expense', {
        params: {
          search: debouncedSearch || undefined,
          engineerName: engineerName || undefined,
          category: category || undefined,
          month: month || undefined,
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
        toast.error('No expenses to download for selected filters');
        return;
      }

      const csvData = rawData.map(expense => ({
        'Date': expense.createdAt ? formatDate(expense.createdAt) : '',
        'Engineer Name': expense.engineerName || '',
        'Group': expense.category || expense.group || '',
        'Category': expense.category || '',
        'Amount': "Rs " + (expense.amount ?? ''),
        'Month': expense.month || '',
        'Period': expense.period || '',
        'Remarks': expense.remarks || ''
      }));

      exportToCSV(csvData, 'Expense_Report.csv');
      toast.success(`Downloaded ${csvData.length} expense records!`);
    } catch (err) {
      if (data && data.length > 0) {
        const csvData = data.map(expense => ({
          'Date': expense.createdAt ? formatDate(expense.createdAt) : '',
          'Engineer Name': expense.engineerName || '',
          'Group': expense.category || expense.group || '',
          'Category': expense.category || '',
          'Amount': "Rs " + (expense.amount ?? ''),
          'Month': expense.month || '',
          'Period': expense.period || '',
          'Remarks': expense.remarks || ''
        }));
        exportToCSV(csvData, 'Expense_Report.csv');
        toast.success(`Downloaded ${csvData.length} loaded records!`);
      } else {
        toast.error('Failed to export expense report');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Expense List" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                placeholder="Search Remarks..."
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
                size="small"
                fullWidth
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                placeholder="Engineer Name"
              />
            </Grid>

            <Grid item xs={6} md={1.5}>
              <TextField
                select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6} md={1.5}>
              <TextField
                select
                fullWidth
                size="small"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                label="Month"
              >
                <MenuItem value="">All</MenuItem>
                {months.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
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

            <Grid item xs={6} md={2}>
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
        {data.map((expense, index) => {
          const isLastElement = index === data.length - 1;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={expense._id || index} ref={isLastElement ? lastElementRef : null}>
              <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 4 }, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip label={`Group: ${expense.category}`} color="primary" size="small" />
                    <Typography variant="h6" color="success.main">
                      ₹{expense.amount}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {expense.engineerName}
                  </Typography>
                  
                  <Grid container spacing={1} mt={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Month</Typography>
                      <Typography variant="body2">{expense.month}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Period</Typography>
                      <Typography variant="body2">{expense.period}</Typography>
                    </Grid>
                  </Grid>

                  {expense.createdAt && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Date: {formatDate(expense.createdAt)}
                      </Typography>
                    </Box>
                  )}

                  {expense.remarks && (
                    <Box mt={2} p={1} bgcolor="action.hover" borderRadius={1}>
                      <Typography variant="body2" color="text.secondary">Remarks:</Typography>
                      <Typography variant="body2" noWrap>{expense.remarks}</Typography>
                    </Box>
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
          title="No Expenses Found" 
          description="We couldn't find any expenses matching your criteria or date range."
        />
      )}
    </Box>
  );
};

export default ExpenseList;
