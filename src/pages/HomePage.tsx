import { Box, Button, Typography, Card, CardContent, Container, Paper, Chip, Snackbar, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Factory, 
  FileText, 
  HelpCircle, 
  Settings, 
  BookOpen, 
  Link2, 
  FlaskConical, 
  Database,
  Atom,
  Shield,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success',
    dbPath: ''
  });

  const handleChangeDatabase = async () => {
    try {
      const result = await window.files.changeDBLocation();
      console.log(result);
      
      if (result.success) {
        setAlert({
          open: true,
          message: 'Database location changed successfully!',
          severity: 'success',
          dbPath: result.dbPath
        });
      } else {
        setAlert({
          open: true,
          message: 'Failed to change database location',
          severity: 'error',
          dbPath: ''
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        open: true,
        message: 'Error changing database location',
        severity: 'error',
        dbPath: ''
      });
    }
  }

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const navigationItems = [
    {
      title: 'Plants',
      description: 'Manage List of Nuclear Power Plants',
      icon: <Factory size={32} />,
      path: '/plants',
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.1)'
    },
    {
      title: 'Exams',
      description: 'Create and organize NRC exams',
      icon: <FileText size={32} />,
      path: '/exams',
      color: '#388e3c',
      bgColor: 'rgba(56, 142, 60, 0.1)'
    },
    {
      title: 'Questions',
      description: 'Build and manage examination question database',
      icon: <HelpCircle size={32} />,
      path: '/questions',
      color: '#f57c00',
      bgColor: 'rgba(245, 124, 0, 0.1)'
    },
    {
      title: 'Systems',
      description: 'Configure nuclear plant system classifications',
      icon: <Settings size={32} />,
      path: '/systems',
      color: '#7b1fa2',
      bgColor: 'rgba(123, 31, 162, 0.1)'
    },
    {
      title: 'Knowledge Areas',
      description: 'Organize content by knowledge and abilitys',
      icon: <BookOpen size={32} />,
      path: '/kas',
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.1)'
    },
    {
      title: 'System KAs',
      description: 'Link systems to knowledge and abilitys for comprehensive coverage',
      icon: <Link2 size={32} />,
      path: '/system_kas',
      color: '#0288d1',
      bgColor: 'rgba(2, 136, 209, 0.1)'
    },
    {
      title: 'Stems',
      description: 'Manage knowledge and ability stems',
      icon: <Atom size={32} />,
      path: '/stems',
      color: '#5d4037',
      bgColor: 'rgba(93, 64, 55, 0.1)'
    },
    {
      title: 'Sandbox',
      description: 'Create new questions not saved to the database for NRC security',
      icon: <FlaskConical size={32} />,
      path: '/sandbox',
      color: '#455a64',
      bgColor: 'rgba(69, 90, 100, 0.1)'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Shield size={48} style={{ marginRight: 16, color: '#1976d2' }} />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1976d2, #388e3c)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block'
            }}
          >
            NRC EXAM MANAGER
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}
        >
          Professional examination management system for nuclear power plant licensing and certification
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip 
            icon={<Atom size={16} />} 
            label="Nuclear Certified" 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            icon={<Shield size={16} />} 
            label="NRC Compliant" 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            icon={<Zap size={16} />} 
            label="Exam Ready" 
            color="warning" 
            variant="outlined" 
          />
        </Box>
      </Box>

      {/* Navigation Cards */}
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: 4,
          justifyContent: 'center'
        }}
      >
        {navigationItems.map((item, index) => (
          <Card
            key={index}
            component={Link}
            to={item.path}
            sx={{
              width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' },
              minWidth: '280px',
              maxWidth: '320px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
                '& .icon-container': {
                  transform: 'scale(1.1)',
                  color: item.color
                }
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease'
              },
              '&:hover::before': {
                transform: 'scaleX(1)'
              }
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box
                className="icon-container"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: item.bgColor,
                  color: item.color,
                  mb: 2,
                  mx: 'auto',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.icon}
              </Box>
              
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mb: 1,
                  color: 'text.primary'
                }}
              >
                {item.title}
              </Typography>
              
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  flex: 1
                }}
              >
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Database Management Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 4,
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f4f8 100%)',
          border: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Database size={32} color="#1976d2" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Database Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your examination database location and settings
              </Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            onClick={handleChangeDatabase}
            startIcon={<Database size={20} />}
            sx={{
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #1976d2, #1565c0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #0d47a1)',
                transform: 'translateY(-1px)',
                boxShadow: 4
              },
              transition: 'all 0.3s ease'
            }}
          >
            Change Database Location
          </Button>
        </Box>
      </Paper>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', mt: 6, py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 NRC Exam Manager - Ensuring nuclear safety through comprehensive examination management
        </Typography>
      </Box>

      {/* Success/Error Alert */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {alert.message}
            </Typography>
            {alert.dbPath && (
              <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'monospace' }}>
                New location: {alert.dbPath}
              </Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>
    </Container>
  );
}