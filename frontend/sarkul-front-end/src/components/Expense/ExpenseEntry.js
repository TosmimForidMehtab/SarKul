import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import SideBarExpense from '../Sidebar/SideBarExpense';
import axios from 'axios';
import Loader from '../Loader';

const categories = ['Travel', 'BackEnd', 'Miscellneous ', 'Courier', 'exp'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const validationSchema = yup.object({
  engineerName: yup.string().required('Name is required'),
  category: yup.string().required('Category is required'),
  month: yup.string().required('Month is required'),
  period: yup.string().required('Period is required'),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be a positive number'),
  // remarks: yup.string().required('Remarks are required'),
});

const ExpenseEntry = () => {
  const [names, setNames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingName, setIsLoadingName] = useState(false);


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
    onSubmit: (values) => {
      console.log('Form Values:', values);
      handleAddExpense();
    },
  });


  const addExpense = async () => {
    setIsLoading(true)
    try {
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/expense';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'Application/json'
        },
      };


      const response = await axios.post(url, formik.values, config);
      alert("Expense added successfully")
      formik.resetForm();

      setIsLoading(false)

    } catch (error) {
      alert(error.response.data.message)
      setIsLoading(false)
    }

  }
  const handleAddExpense = () => {
    addExpense()

  }


  useEffect(() => {
    getEngineerName();
  }, [])
  async function getEngineerName() {
    try {
      setIsLoadingName(true)
      let token = sessionStorage.getItem("accessToken");
      let url = 'https://sarkultechapi.onrender.com/api/v1/engineer?status=active';
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let response = await axios.get(url, config);
      let engList = response?.data?.data?.data || response?.data?.data;
      let safeList = Array.isArray(engList) ? engList : [];
      setNames(safeList.map((item) => item?.employeeName));
      setIsLoadingName(false)
    }
    catch (error) {
      console.log(error);
      setIsLoadingName(false)
    }
  }

  return (
    <div>
      <SideBarExpense />

      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3} direction={'row'} sx={{ width: '90%', margin: 'auto', mt: 5, justifyContent: 'space-evenly' }}>

          <Stack gap={6} width={'220px'} >

            {/* Name Autocomplete */}
            <Autocomplete
              options={names}
              loading={isLoadingName}
              value={formik.values.engineerName}
              onChange={(event, value) => formik.setFieldValue('engineerName', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Name"
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              )}
            />

            {/* Category Autocomplete */}
            <Autocomplete
              options={categories}
              onChange={(event, value) => formik.setFieldValue('category', value)}
              value={formik.values.category}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                />
              )}
            />

            {/* Month Dropdown */}
            <TextField
              select
              label="Month"
              name="month"
              value={formik.values.month}
              onChange={formik.handleChange}
              error={formik.touched.month && Boolean(formik.errors.month)}
              helperText={formik.touched.month && formik.errors.month}
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </TextField>

            {/* Period Dropdown */}
            <TextField
              select
              label="Period"
              name="period"
              value={formik.values.period}
              onChange={formik.handleChange}
              error={formik.touched.period && Boolean(formik.errors.period)}
              helperText={formik.touched.period && formik.errors.period}
            >
              <MenuItem value="1-15">1-15</MenuItem>
              <MenuItem value="16-30">16-30</MenuItem>
              <MenuItem value="1-30">1-30</MenuItem>
            </TextField>


          </Stack>

          <Stack gap={6} width={'220px'}>
            {/* Amount TextField */}
            <TextField
              label="Amount (₹)"
              name="amount"
              value={formik.values.amount}
              onChange={formik.handleChange}
              error={formik.touched.amount && Boolean(formik.errors.amount)}
              helperText={formik.touched.amount && formik.errors.amount}
            />
            {/* Remarks TextField */}
            <TextField
              label="Remarks"
              name="remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              error={formik.touched.remarks && Boolean(formik.errors.remarks)}
              helperText={formik.touched.remarks && formik.errors.remarks}
              multiline
              rows={3}
            />

            {/* Submit Button */}
            <Button
              variant="contained"
              type="submit"
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>

          </Stack>
        </Stack>
      </form>

    </div>
  );
};

export default ExpenseEntry;
