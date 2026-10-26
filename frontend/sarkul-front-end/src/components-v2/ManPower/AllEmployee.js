import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import PageHeader from '../shared/PageHeader';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import EmptyState from '../shared/EmptyState';
import StatusBadge from '../shared/StatusBadge';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'react-toastify';

const AllEmployee = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [sortParam, setSortParam] = useState('-createdAt'); // Default sort

  const debouncedSearch = useDebounce(searchTerm, 500);

  const queryParams = useMemo(() => {
    const params = { sort: sortParam };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.status = statusFilter.toLowerCase();
    if (designationFilter) params.employeeDesignation = designationFilter;
    return params;
  }, [debouncedSearch, statusFilter, designationFilter, sortParam]);

  const { data: employees, loading, error, hasMore, lastElementRef } = useInfiniteScroll(
    '/engineer',
    queryParams
  );

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleStatusChange = (e) => setStatusFilter(e.target.value);
  const handleDesignationChange = (e) => setDesignationFilter(e.target.value);
  const handleSortChange = (e) => setSortParam(e.target.value);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'resigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  useEffect(() => { if (error) toast.error(error); }, [error]);

  return (
    <Box>
      <PageHeader
        title="All Employees"
        breadcrumbs={[
          { label: 'Dashboard', path: '/v2/dashboard' },
          { label: 'ManPower', path: '/v2/man-power/all' },
          { label: 'All Employees' }
        ]}
        actionButton={{
          label: 'Add Employee',
          icon: <AddIcon />,
          onClick: () => navigate('/v2/man-power/entry')
        }}
      />

      {/* Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Employees"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, code, email..."
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={handleStatusChange}
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="resigned">Resigned</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Designation"
                variant="outlined"
                value={designationFilter}
                onChange={handleDesignationChange}
                placeholder="Filter by designation..."
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Sort By"
                value={sortParam}
                onChange={handleSortChange}
                size="small"
              >
                <MenuItem value="-createdAt">Newest First</MenuItem>
                <MenuItem value="employeeName">Name (A-Z)</MenuItem>
                <MenuItem value="-employeeName">Name (Z-A)</MenuItem>
                <MenuItem value="-joinDate">Join Date</MenuItem>
                <MenuItem value="-salary">Salary (High to Low)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* List */}
      <Grid container spacing={3}>
        {employees.map((emp, index) => {
          const isLast = employees.length === index + 1;
          const currentStatus = emp.status || 'active';
          return (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={emp._id || index}
              ref={isLast ? lastElementRef : null}
            >
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <AccountCircleIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {emp.employeeName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {emp.employeeCode}
                        </Typography>
                      </Box>
                    </Box>
                    <StatusBadge status={currentStatus} customColor={getStatusColor(currentStatus)} />
                  </Box>

                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {emp.employeeDesignation || 'No Designation'}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{emp.employeeContact || 'N/A'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2">{emp.employeeEmail || 'N/A'}</Typography>
                  </Box>

                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {emp.skills && emp.skills.map((skill, idx) => (
                      <Chip key={idx} label={skill} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
                <Box p={2} pt={0} display="flex" justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/v2/man-power/info?code=${emp.employeeCode}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Loading & Empty States */}
      {loading && (
        <Box mt={3}>
          <CardSkeleton count={3} />
        </Box>
      )}
      
      {!loading && employees.length === 0 && (
        <EmptyState
          message="No employees found"
          subMessage="Try adjusting your filters or search term."
          actionLabel="Add New Employee"
          onAction={() => navigate('/v2/man-power/entry')}
        />
      )}

      {/* End of list */}
      {!loading && !hasMore && employees.length > 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, mb: 2 }}>
          You have reached the end of the list.
        </Typography>
      )}
    </Box>
  );
};

export default AllEmployee;
