import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Grid, TextField, MenuItem, Button, 
  CircularProgress, Autocomplete 
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';
import PageHeader from '../shared/PageHeader';

const categories = ['Travel', 'BackEnd', 'Miscellneous', 'Courier', 'exp'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const validationSchema = yup.object({
  engineerName: yup.string().required('Engineer Name is required'),
  category: yup.string().required('Category is required'),
  month: yup.string().required('Month is required'),
  period: yup.string().required('Period is required'),
  amount: yup.number().required('Amount is required').positive('Amount must be a positive number'),
  remarks: yup.string(),
});

const ExpenseEntry = () => {
  const [loading, setLoading] = useState(false);
  const [engineerOptions, setEngineerOptions] = useState([]);
  
  const fetchEngineers = async () => {
    try {
      const res = await api.get(`/engineer?status=active&limit=1000`);
      setEngineerOptions(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  const formik = useFormik({
    initialValues: {
      engineerName: '',
      category: '',
      month: '',
      period: '',
      amount: '',
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await api.post('/expense', values);
        toast.success(response?.data?.message || 'Expense added successfully');
        resetForm();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error adding expense');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box>
      <PageHeader title="Expense Entry" />
      
      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Engineer Name"
                  name="engineerName"
                  value={formik.values.engineerName}
                  onChange={formik.handleChange}
                  error={formik.touched.engineerName && Boolean(formik.errors.engineerName)}
                  helperText={formik.touched.engineerName && formik.errors.engineerName}
                  required
                >
                  {engineerOptions.map((eng, idx) => (
                    <MenuItem key={idx} value={eng.employeeName || eng}>{eng.employeeName || eng}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                  required
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Month"
                  name="month"
                  value={formik.values.month}
                  onChange={formik.handleChange}
                  error={formik.touched.month && Boolean(formik.errors.month)}
                  helperText={formik.touched.month && formik.errors.month}
                  required
                >
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Period"
                  name="period"
                  value={formik.values.period}
                  onChange={formik.handleChange}
                  error={formik.touched.period && Boolean(formik.errors.period)}
                  helperText={formik.touched.period && formik.errors.period}
                  required
                >
                  {['1-15', '16-30', '1-30'].map((p) => (
                    <MenuItem key={p} value={p}>{p}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount (₹)"
                  name="amount"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Remarks"
                  name="remarks"
                  value={formik.values.remarks}
                  onChange={formik.handleChange}
                  error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                  helperText={formik.touched.remarks && formik.errors.remarks}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Submit Expense
                </Button>
              </Grid>
              
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ExpenseEntry;


