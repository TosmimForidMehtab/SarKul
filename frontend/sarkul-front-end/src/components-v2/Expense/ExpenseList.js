import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, MenuItem, 
  Grid, InputAdornment, Stack, Chip, Button
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Download as DownloadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../shared/EmptyState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV } from '../../utils/exportToCSV';
import { formatDate } from '../../utils/formatDate';

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
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data, loading, error, hasMore, lastElementRef } = useInfiniteScroll('/expense', {
    search: debouncedSearch,
    engineerName: engineerName || undefined,
    category: category || undefined,
    month: month || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

    useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data to download');
      return;
    }
    const csvData = data.map(expense => ({
      EngineerName: expense.engineerName,
      Category: expense.category,
      Amount: "Rs " + expense.amount,
      Month: expense.month,
      Period: expense.period,
      Remarks: expense.remarks || '',
      Date: expense.createdAt ? formatDate(expense.createdAt) : ''
    }));
    exportToCSV(csvData, 'Expense_Report.csv');
  };

  return (
    <Box>
      <PageHeader title="Expense List" />
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
            
            <Grid item xs={12} md={9}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">Filters:</Typography>
                </Box>
                
                <TextField
                  size="small"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  placeholder="Engineer Name"
                  sx={{ minWidth: 150 }}
                />

                <TextField
                  select
                  size="small"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{ minWidth: 140 }}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>

                                <TextField
                  select
                  size="small"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  sx={{ minWidth: 120 }}
                  label="Month"
                >
                  <MenuItem value="">All</MenuItem>
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
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
        {data.map((expense, index) => {
          const isLastElement = index === data.length - 1;
          
          return (
            <Grid item xs={12} md={6} lg={4} key={expense._id} ref={isLastElement ? lastElementRef : null}>
              <Card sx={{ height: '100%', transition: '0.3s', '&:hover': { boxShadow: 4 }, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip label={expense.category} color="primary" size="small" />
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
          description="We couldn't find any expenses matching your criteria."
        />
      )}
    </Box>
  );
};

export default ExpenseList;




