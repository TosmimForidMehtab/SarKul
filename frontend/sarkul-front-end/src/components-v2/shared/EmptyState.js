import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ title, description, actionButton, icon }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      py: 8,
      px: 2,
      textAlign: 'center'
    }}>
      <Box sx={{ color: 'text.secondary', mb: 2, '& svg': { fontSize: 80, opacity: 0.5 } }}>
        {icon || <InboxIcon />}
      </Box>
      <Typography variant="h5" color="secondary" gutterBottom>
        {title || 'No data found'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description || 'There is nothing to display here at the moment.'}
      </Typography>
      {actionButton && (
        <Button variant="contained" color="primary" onClick={actionButton.onClick}>
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
