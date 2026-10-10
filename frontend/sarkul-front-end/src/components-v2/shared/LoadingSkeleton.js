import React from 'react';
import { Skeleton, Box, Stack } from '@mui/material';

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 1, borderRadius: 1 }} />
      {Array.from(new Array(rows)).map((_, index) => (
        <Skeleton key={index} variant="rectangular" width="100%" height={40} sx={{ my: 0.5, borderRadius: 1 }} />
      ))}
    </Box>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <Stack spacing={2} direction="row" flexWrap="wrap">
      {Array.from(new Array(count)).map((_, index) => (
        <Skeleton key={index} variant="rectangular" width={250} height={150} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );
};
