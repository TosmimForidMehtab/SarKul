import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const PageHeader = ({ title, breadcrumbs, actionButton }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box>
        <Typography variant="h4" color="secondary" gutterBottom>
          {title}
        </Typography>
        {breadcrumbs && (
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography key={index} color="text.primary">
                  {crumb.label}
                </Typography>
              ) : (
                <Link component={RouterLink} color="inherit" to={crumb.path} key={index}>
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}
      </Box>
      {actionButton && (
        <Box>
          <Button variant="contained" color="primary" onClick={actionButton.onClick} startIcon={actionButton.icon}>
            {actionButton.label}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
