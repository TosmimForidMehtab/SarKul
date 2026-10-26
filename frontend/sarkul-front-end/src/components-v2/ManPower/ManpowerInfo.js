import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  Avatar,
  Divider,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import CakeIcon from '@mui/icons-material/Cake';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DescriptionIcon from '@mui/icons-material/Description';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WorkIcon from '@mui/icons-material/Work';

import PageHeader from '../shared/PageHeader';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatDate';

const ManpowerInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialCode = queryParams.get('code');

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch options for Autocomplete
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const res = await api.get(`/engineer?limit=100&search=${debouncedSearch}`);
        setOptions(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.data || []));
      } catch (error) {
        console.error('Failed to fetch lookup data', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, [debouncedSearch]);

  // Fetch full details when an employee is selected via dropdown or URL
  useEffect(() => {
    if (selectedEmployee?.employeeCode && selectedEmployee.employeeCode !== employeeDetails?.employeeCode) {
      fetchEmployeeDetails(selectedEmployee.employeeCode);
      navigate(`/v2/man-power/info?code=${selectedEmployee.employeeCode}`, { replace: true });
    } else if (!selectedEmployee && !initialCode) {
      setEmployeeDetails(null);
      navigate(`/v2/man-power/info`, { replace: true });
    }
  }, [selectedEmployee, navigate, employeeDetails, initialCode]);

  // Initial load if code is in URL
  useEffect(() => {
    if (initialCode && !selectedEmployee) {
      fetchEmployeeDetails(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployeeDetails = async (code) => {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/engineer/${code}`);
      setEmployeeDetails(res.data.data);
      setSelectedEmployee((prev) => {
        if (prev?.employeeCode === res.data.data.employeeCode) return prev;
        return {
          employeeCode: res.data.data.employeeCode,
          employeeName: res.data.data.employeeName
        };
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch employee details');
      setEmployeeDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'resigned': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <PageHeader
        title="Employee Information"
        breadcrumbs={[
          { label: 'Dashboard', path: '/v2/dashboard' },
          { label: 'ManPower', path: '/v2/man-power/all' },
          { label: 'Info' }
        ]}
      />

      {/* Search Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Autocomplete
            options={options}
            getOptionLabel={(option) => `${option.employeeName} (${option.employeeCode})`}
            value={selectedEmployee}
            onChange={(event, newValue) => setSelectedEmployee(newValue)}
            onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)}
            loading={loadingOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Employee"
                variant="outlined"
                placeholder="Type name or code..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loadingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Loading State */}
      {loadingDetails && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loadingDetails && !employeeDetails && (
        <EmptyState
          message="No Employee Selected"
          subMessage="Search for an employee using the bar above to view their details."
        />
      )}

      {/* Details View */}
      {!loadingDetails && employeeDetails && (
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Avatar
                  sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
                >
                  <AccountCircleIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {employeeDetails.employeeName}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {employeeDetails.employeeCode}
                </Typography>
                <Box mb={2}>
                  <StatusBadge
                    status={employeeDetails.status || 'active'}
                    customColor={getStatusColor(employeeDetails.status || 'active')}
                  />
                </Box>
                <Typography variant="body1" color="primary" gutterBottom>
                  {employeeDetails.employeeDesignation || 'No Designation'}
                </Typography>
                <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1} mt={2}>
                  {employeeDetails.skills?.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" variant="outlined" color="primary" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Details Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1 }} color="primary" /> Personal Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EmailIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Email:</Typography>
                      <Typography variant="body2">{employeeDetails.employeeEmail}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Contact:</Typography>
                      <Typography variant="body2">{employeeDetails.employeeContact}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CakeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>DOB:</Typography>
                      <Typography variant="body2">{formatDate(employeeDetails.employeeDOB)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                      <HomeIcon color="action" fontSize="small" sx={{ mt: 0.2 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Address:</Typography>
                      <Typography variant="body2">{employeeDetails.employeeAddress}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <WorkIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Reference:</Typography>
                      <Typography variant="body2">{employeeDetails.reference || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom display="flex" alignItems="center" sx={{ mt: 4 }}>
                  <WorkIcon sx={{ mr: 1 }} color="primary" /> Employment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" gap={1} mb={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Join Date:</Typography>
                      <Typography variant="body2">{formatDate(employeeDetails.joinDate)}</Typography>
                    </Box>
                    <Box display="flex" gap={1} mb={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Salary:</Typography>
                      <Typography variant="body2">₹ {employeeDetails.salary}</Typography>
                    </Box>
                    <Box display="flex" gap={1} mb={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Experience:</Typography>
                      <Typography variant="body2">{employeeDetails.experience} Years</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" gap={1} mb={1}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Qualification:</Typography>
                      <Typography variant="body2">{employeeDetails.qualification}</Typography>
                    </Box>
                    {employeeDetails.resignedAt && (
                      <Box display="flex" gap={1} mb={1}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Resigned At:</Typography>
                        <Typography variant="body2" color="error">{formatDate(employeeDetails.resignedAt)}</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom display="flex" alignItems="center" sx={{ mt: 4 }}>
                  <DescriptionIcon sx={{ mr: 1 }} color="primary" /> Documents
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" gap={2}>
                  {employeeDetails.idProof ? (
                    <Button
                      variant="outlined"
                      startIcon={<BadgeIcon />}
                      component="a"
                      href={employeeDetails.idProof}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View ID Proof
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No ID Proof uploaded</Typography>
                  )}

                  {employeeDetails.certificate ? (
                    <Button
                      variant="outlined"
                      startIcon={<DescriptionIcon />}
                      component="a"
                      href={employeeDetails.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Certificate
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No Certificate uploaded</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ManpowerInfo;
