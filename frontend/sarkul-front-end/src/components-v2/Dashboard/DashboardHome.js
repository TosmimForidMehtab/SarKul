import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import {
  PhoneCallback as CallsIcon,
  PendingActions as PendingIcon,
  CheckCircleOutline as CompletedIcon,
  PeopleAlt as EngineersIcon,
  Inventory2 as StockIcon,
  Add as AddIcon
} from '@mui/icons-material';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import StatusBadge from '../shared/StatusBadge';
import { CardSkeleton, TableSkeleton } from '../shared/LoadingSkeleton';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', borderRadius: 2 }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </Box>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
        {icon}
      </Avatar>
    </CardContent>
  </Card>
);

const DashboardHome = () => {
  const [stats, setStats] = useState({ totalCalls: 0, pendingCalls: 0, completedCalls: 0, totalEngineers: 0, totalStock: 0 });
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, callsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/call?status=pending&limit=5')
        ]);
        setStats(statsRes.data.data || statsRes.data);
        setRecentCalls(callsRes.data.data || callsRes.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <Box p={3}><CardSkeleton count={5} /><Box mt={4}><TableSkeleton /></Box></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's what's happening today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} to="/v2/call-master/create" variant="contained" color="primary" startIcon={<AddIcon />}>
            New Call
          </Button>
          <Button component={Link} to="/v2/stock/entry" variant="outlined" color="primary" startIcon={<AddIcon />}>
            New Stock
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total Calls" value={stats.totalCalls} icon={<CallsIcon fontSize="large" />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Pending" value={stats.pendingCalls} icon={<PendingIcon fontSize="large" />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Closed Calls" value={stats.closedCalls} icon={<CompletedIcon fontSize="large" />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Engineers" value={stats.totalEngineers} icon={<EngineersIcon fontSize="large" />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Available Stock" value={stats.totalStocks} icon={<StockIcon fontSize="large" />} color="secondary" />
        </Grid>
      </Grid>

      {/* Recent Pending Calls Table */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Recent Pending Calls
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="recent calls table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Call ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(Array.isArray(recentCalls) ? recentCalls : recentCalls?.calls || recentCalls?.data || []).map((row) => (
                    <TableRow key={row.callId || row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                        <Link to={`/v2/call-master/details?id=${row.callId}`} style={{ textDecoration: 'none', color: '#1a2b4a' }}>
                          {row.callId}
                        </Link>
                      </TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!recentCalls || (Array.isArray(recentCalls) ? recentCalls : recentCalls?.calls || recentCalls?.data || []).length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No pending calls currently.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Placeholder for future widgets like Quick Links or Notifications */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: '100%', minHeight: 300 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              System Alerts
            </Typography>
            <Box sx={{ p: 2, backgroundColor: 'error.light', color: 'error.contrastText', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" fontWeight="bold">Low Stock Warning</Typography>
              <Typography variant="caption">5 items are below minimum threshold.</Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: 'info.light', color: 'info.contrastText', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">System Maintenance</Typography>
              <Typography variant="caption">Scheduled for Sunday 2 AM.</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
