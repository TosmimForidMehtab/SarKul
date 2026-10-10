import React from 'react';
import { AppBar, Toolbar, Box, InputBase, Breadcrumbs, Link, Typography, IconButton, Avatar, Button, Chip } from '@mui/material';
import { Search as SearchIcon, NavigateNext as NavigateNextIcon, NotificationsNone as NotificationsIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useUIVersion } from '../../contexts/UIVersionContext';

const Navbar = ({ drawerWidth }) => {
  const location = useLocation();
  const { toggleUiVersion } = useUIVersion();

  // Basic breadcrumb generation based on path
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/v2/dashboard">
              Home
            </Link>
            {pathnames.slice(1).map((value, index) => {
              const last = index === pathnames.length - 2;
              const to = `/v2/${pathnames.slice(1, index + 2).join('/')}`;
              const title = value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ');

              return last ? (
                <Typography color="text.primary" key={to}>
                  {title}
                </Typography>
              ) : (
                <Link underline="hover" color="inherit" href={to} key={to}>
                  {title}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0.04)', 
            borderRadius: 2, 
            px: 2, 
            py: 0.5 
          }}>
            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase placeholder="Search..." sx={{ width: 200 }} />
          </Box>

          {/* UI Toggle */}
          <Chip
            label="Switch to Classic UI 🔙"
            color="primary"
            variant="outlined"
            onClick={() => {
              localStorage.setItem('ui-version', 'classic');
              window.location.reload();
            }}
            sx={{ cursor: 'pointer', fontWeight: 'bold' }}
          />

          <IconButton>
            <NotificationsIcon />
          </IconButton>
          
          <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>A</Avatar>

          <Button 
            color="error" 
            variant="outlined"
            onClick={() => {
              sessionStorage.removeItem('accessToken');
              window.location.href = '/v2/login';
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
