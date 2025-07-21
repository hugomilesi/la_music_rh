import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { SentimentDissatisfied as EmptyIcon } from '@mui/icons-material';

interface EmptyStateProps {
  message: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 6,
        px: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'divider'
      }}
    >
      {icon || <EmptyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />}
      
      <Typography variant="h6" component="h3" gutterBottom>
        {message}
      </Typography>
      
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          {description}
        </Typography>
      )}
      
      {actionText && onAction && (
        <Button
          variant="contained"
          color="primary"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;