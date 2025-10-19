import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Stack,
  Chip,
  Divider
} from '@mui/material'
import {
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  Description as DocumentIcon,
  Dashboard as DashboardIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Verified as VerifiedIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

export default function Landing() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { darkMode } = useCustomTheme()

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 50 }} />,
      title: 'Advanced Security',
      description: 'Military-grade encryption and multi-factor authentication to protect your digital identity',
      color: '#4CAF50'
    },
    {
      icon: <FingerprintIcon sx={{ fontSize: 50 }} />,
      title: 'Biometric Authentication',
      description: 'Secure access using your fingerprint or facial recognition technology',
      color: '#2196F3'
    },
    {
      icon: <DocumentIcon sx={{ fontSize: 50 }} />,
      title: 'Document Management',
      description: 'Store, organize, and manage all your identity documents in one secure location',
      color: '#FF9800'
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 50 }} />,
      title: 'Smart Dashboard',
      description: 'Real-time monitoring of your identity status and document expiration dates',
      color: '#9C27B0'
    },
    {
      icon: <ShieldIcon sx={{ fontSize: 50 }} />,
      title: 'Privacy Protection',
      description: 'Your data is encrypted and protected with industry-leading security standards',
      color: '#F44336'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 50 }} />,
      title: 'Lightning Fast',
      description: 'Instant access to your documents and identity verification in seconds',
      color: '#00BCD4'
    }
  ]

  const stats = [
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '256-bit', label: 'Encryption' },
    { number: '24/7', label: 'Support' },
    { number: '100%', label: 'Secure' }
  ]

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: darkMode 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Background Pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
        `,
        zIndex: 0
      }} />
      
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" component="h1" fontWeight="bold" sx={{ 
              color: 'white', 
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Identra
            </Typography>
            <Typography variant="h4" sx={{ 
              color: 'rgba(255,255,255,0.95)', 
              mb: 2,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontWeight: 600
            }}>
              Next-Generation Digital Identity Management
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              mb: 6,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Secure, fast, and reliable identity verification platform trusted by millions worldwide. 
              Experience the future of digital identity with cutting-edge biometric authentication and military-grade encryption.
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 8 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  minWidth: 220,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  minWidth: 220,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 4,
                  borderColor: 'white',
                  color: 'white',
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(255,255,255,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Get Started
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <Card sx={{ 
                    textAlign: 'center', 
                    p: 3,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {stat.label}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Powerful Features
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', mx: 'auto' }}>
              Everything you need for secure digital identity management
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card sx={{ 
                    height: '100%',
                    p: 4,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 4,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                      '&::before': {
                        opacity: 1
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${feature.color}15, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: 0
                    }
                  }}>
                    <Box sx={{ 
                      color: feature.color, 
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ 
                      fontWeight: 'bold', 
                      mb: 2, 
                      color: 'text.primary',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      color: 'text.secondary', 
                      lineHeight: 1.6,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card sx={{ 
            p: 6,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              Ready to Secure Your Digital Identity?
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
              Join thousands of users who trust Identra for their digital identity management
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 3,
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Card>
        </motion.div>
      </Container>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            © 2025 Identra. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Chip label="Secure" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            <Chip label="Encrypted" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            <Chip label="Compliant" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
            <Chip label="Trusted" size="small" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
          </Stack>
        </Box>
      </motion.div>
    </Box>
  )
}
