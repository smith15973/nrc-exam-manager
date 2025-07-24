// src/pages/ErrorPage.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Stack
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowBack, Refresh } from '@mui/icons-material';

interface ErrorPageProps {
  errorType?: 'notFound' | 'general' | 'network';
  errorMessage?: string;
  showBackButton?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ 
  errorType = 'notFound',
  errorMessage,
  showBackButton = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getErrorContent = () => {
    switch (errorType) {
      case 'notFound':
        return {
          title: '404 - Page Not Found',
          message: errorMessage || `The page "${location.pathname}" could not be found.`,
          icon: '🔍'
        };
      case 'network':
        return {
          title: 'Network Error',
          message: errorMessage || 'Unable to connect to the server. Please check your connection.',
          icon: '🌐'
        };
      case 'general':
      default:
        return {
          title: 'Something went wrong',
          message: errorMessage || 'An unexpected error occurred. Please try again.',
          icon: '⚠️'
        };
    }
  };

  const errorContent = getErrorContent();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        py={4}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            maxWidth: 500,
            width: '100%'
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: '4rem',
              mb: 2,
              opacity: 0.7
            }}
          >
            {errorContent.icon}
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            color="text.primary"
          >
            {errorContent.title}
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {errorContent.message}
          </Typography>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
              size="large"
            >
              Go Home
            </Button>
            
            {showBackButton && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                size="large"
              >
                Go Back
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              size="large"
            >
              Refresh
            </Button>
          </Stack>

          {process.env.NODE_ENV === 'development' && (
            <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="caption" color="text.secondary">
                <strong>Debug Info:</strong><br />
                Current Path: {location.pathname}<br />
                Error Type: {errorType}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorPage;