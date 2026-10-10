import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary.main' }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', w: '100%', width: '100%', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" color="secondary">
            {value}
          </Typography>
        </Box>
        <Box sx={{ 
          backgroundColor: `${color}15`, 
          p: 1.5, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color
        }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
