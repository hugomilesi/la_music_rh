import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  size?: number;
  fullHeight?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 40,
  fullHeight = false
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        height: fullHeight ? '100%' : 'auto',
        minHeight: fullHeight ? 400 : 'auto'
      }}
    >
      <CircularProgress size={size} sx={{ mb: 2 }} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingState;
export { LoadingState };