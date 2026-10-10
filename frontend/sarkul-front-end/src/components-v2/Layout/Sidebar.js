import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box, Typography, Collapse } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Phone as PhoneIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  CompareArrows as TransactionIcon,
  Receipt as ExpenseIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/v2/dashboard' },
  { 
    text: 'Call Master', icon: <PhoneIcon />, path: '/v2/call-master',
    subItems: [
      { text: 'Call Log', path: '/v2/call-master/create' },
      { text: 'Pending Calls', path: '/v2/call-master/pending' },
      { text: 'Closed Calls', path: '/v2/call-master/closed' },
      { text: 'Call Assign', path: '/v2/call-master/assign' },
      { text: 'Call Register', path: '/v2/call-master/register' },
      { text: 'Call Details', path: '/v2/call-master/details' }
    ]
  },
  { 
    text: 'Stock', icon: <InventoryIcon />, path: '/v2/stock',
    subItems: [
      { text: 'All Stock', path: '/v2/stock/all' },
      { text: 'Current Stock', path: '/v2/stock/current' },
      { text: 'Stock Entry', path: '/v2/stock/entry' },
      { text: 'Office Repair', path: '/v2/stock/office-repair' },
      { text: 'Branch Stock List', path: '/v2/stock/branch-list' },
      { text: 'Branch Stock Entry', path: '/v2/stock/branch-entry' }
    ]
  },
  { 
    text: 'Man Power', icon: <PeopleIcon />, path: '/v2/man-power',
    subItems: [
      { text: 'All Employees', path: '/v2/man-power/all' },
      { text: 'Manpower Entry', path: '/v2/man-power/entry' }
    ]
  },
  { 
    text: 'Part Transaction', icon: <TransactionIcon />, path: '/v2/part-transaction',
    subItems: [
      { text: 'Transaction Details', path: '/v2/part-transaction/details' },
      { text: 'Branch to Engineer', path: '/v2/part-transaction/b2e' },
      { text: 'Engineer to Branch', path: '/v2/part-transaction/e2b' }
    ]
  },
  { 
    text: 'Expense', icon: <ExpenseIcon />, path: '/v2/expense',
    subItems: [
      { text: 'Expense List', path: '/v2/expense/list' },
      { text: 'Expense Entry', path: '/v2/expense/entry' }
    ]
  }
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const handleToggleMenu = (text) => {
    setOpenMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: 'background.default', borderRight: '1px solid rgba(0, 0, 0, 0.08)' },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            SarKul Pro
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const hasSub = item.subItems && item.subItems.length > 0;
            const isOpen = openMenus[item.text] || isActive; // Auto open if active

            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.5, px: 2 }}>
                  <ListItemButton
                    onClick={() => {
                      if (hasSub) {
                        handleToggleMenu(item.text);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: isActive && !hasSub ? 'primary.main' : 'transparent',
                      color: isActive && !hasSub ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        backgroundColor: isActive && !hasSub ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive && !hasSub ? 'primary.contrastText' : 'text.secondary', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }} />
                    {hasSub ? (isOpen ? <ExpandLess /> : <ExpandMore />) : null}
                  </ListItemButton>
                </ListItem>
                {hasSub && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subItems.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <ListItemButton
                            key={subItem.text}
                            onClick={() => navigate(subItem.path)}
                            sx={{
                              pl: 7, pr: 2, py: 0.5, mb: 0.5, mr: 2, ml: 2,
                              borderRadius: 2,
                              backgroundColor: isSubActive ? 'rgba(72, 204, 172, 0.1)' : 'transparent',
                              color: isSubActive ? 'primary.main' : 'text.secondary',
                            }}
                          >
                            <ListItemText primary={subItem.text} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSubActive ? 600 : 400 }} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
