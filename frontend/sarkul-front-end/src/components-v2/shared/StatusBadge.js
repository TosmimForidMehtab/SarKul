import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status, customColor }) => {
  const getStatusConfig = (s) => {
    const rawLabel = s || 'Active';
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
      case 'active':
        return { color: 'success', label: 'Active' };
      case 'inactive':
        return { color: 'error', label: 'Inactive' };
      case 'resigned':
        return { color: 'warning', label: 'Resigned' };
      case 'assigned':
        return { color: 'info', label: 'Assigned' };
      case 'faulty':
      case 'damaged':
      case 'cancelled':
      case 'scrap':
      case 'scrapped':
      case 'unavailable':
        return { color: 'error', label };
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
      color={customColor || config.color} 
      size="small" 
      sx={{ fontWeight: 'bold' }} 
    />
  );
};

export default StatusBadge;
