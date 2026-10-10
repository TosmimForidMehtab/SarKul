import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (s) => {
    const rawLabel = s || 'Unknown';
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
    
    switch (s?.toLowerCase()) {
      case 'pending':
        return { color: 'warning', label };
      case 'completed':
      case 'closed':
      case 'working':
      case 'available':
      case 'new':
      case 'repaired':
        return { color: 'success', label };
      case 'faulty':
      case 'damaged':
      case 'cancelled':
      case 'scrap':
      case 'scrapped':
      case 'unavailable':
        return { color: 'error', label };
      case 'active':
      case 'assigned':
        return { color: 'info', label };
      case 'maintenance':
      case 'oempending':
        return { color: 'secondary', label };
      default:
        return { color: 'default', label };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip 
      label={config.label} 
      color={config.color} 
      size="small" 
      sx={{ fontWeight: 'bold' }} 
    />
  );
};

export default StatusBadge;
