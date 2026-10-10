import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const drawerWidth = 260;

const DashboardLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <CssBaseline />
      <Navbar drawerWidth={drawerWidth} />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          mt: 8 // margin top to account for the fixed app bar
        }}
      >
        {/* Render child routes here */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
