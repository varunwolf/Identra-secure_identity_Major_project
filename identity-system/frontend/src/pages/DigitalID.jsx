import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Fingerprint as FingerprintIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import QRCode from 'qrcode.react'
import { useAuth } from '../contexts/AuthContext.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function DigitalID() {
  const { user } = useAuth()
  const { darkMode } = useCustomTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  useEffect(() => {
    fetchDigitalID()
  }, [])

  const fetchDigitalID = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/digital-id')
      setData(response.data)
    } catch (err) {
      setError(err.message)
      console.error('Digital ID fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!data) return
    
    // Create a downloadable version of the digital ID
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 400
    canvas.height = 600
    
    // Draw ID card background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw header
    ctx.fillStyle = '#673ab7'
    ctx.fillRect(0, 0, canvas.width, 80)
    
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('IDENTRA', canvas.width / 2, 30)
    ctx.font = '14px Arial'
    ctx.fillText('Digital Identity Card', canvas.width / 2, 50)
    
    // Draw user info
    ctx.fillStyle = '#333'
    ctx.font = '16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Name: ${user?.name}`, 20, 120)
    ctx.fillText(`Email: ${user?.email}`, 20, 150)
    ctx.fillText(`ID: ${data.idNumber}`, 20, 180)
    ctx.fillText(`Issued: ${new Date(data.issuedAt).toLocaleDateString()}`, 20, 210)
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `identra-digital-id-${data.idNumber}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
    
    toast.success('Digital ID downloaded successfully!')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Identra Digital ID',
          text: `Check out my digital identity: ${data.idNumber}`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`My Identra Digital ID: ${data.idNumber}`)
      toast.success('ID information copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDigitalID} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Container>
    )
  }

  if (!data) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          No digital ID found. Please contact support.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Digital Identity Card
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your secure digital identity powered by blockchain technology
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main ID Card */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card 
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                      IDENTRA
                    </Typography>
                    <Chip 
                      icon={<VerifiedIcon />} 
                      label="VERIFIED" 
                      color="success" 
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  </Box>

                  {/* User Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      src={user?.avatar}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mr: 3,
                        border: '3px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {user?.email}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        ID: {data.idNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />

                  {/* Additional Info */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Issued Date
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {new Date(data.issuedAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Status
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.light">
                        Active
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Security Features */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {user?.twoFactorEnabled && (
                      <Chip 
                        icon={<SecurityIcon />} 
                        label="2FA Enabled" 
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                      />
                    )}
                    {user?.biometricEnabled && (
                      <Chip 
                        icon={<FingerprintIcon />} 
                        label="Biometric" 
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                      />
                    )}
                    <Chip 
                      icon={<VerifiedIcon />} 
                      label="Blockchain Verified" 
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* QR Code and Actions */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card sx={{ 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)'
                }
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                    Digital Identity QR Code
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'white', 
                      borderRadius: 3, 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #e0e0e0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      mb: 2,
                      minHeight: '220px',
                      minWidth: '220px'
                    }}
                  >
                    <ErrorBoundary>
                      <QRCode 
                        value={data.idNumber} 
                        size={200}
                        level="M"
                        renderAs="svg"
                      />
                    </ErrorBoundary>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    Scan to verify identity
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Contains encrypted identity information
                  </Typography>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={() => setQrDialogOpen(true)}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  View QR Code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Download ID
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Share
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  fullWidth
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Print
                </Button>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Security Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Security Features
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <VerifiedIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Blockchain Verification"
                    secondary="Your identity is verified and stored on a secure blockchain network"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Encrypted Data"
                    secondary="All personal information is encrypted using military-grade encryption"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FingerprintIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Biometric Protection"
                    secondary="Your identity is protected by advanced biometric authentication"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* QR Code Dialog */}
      <Dialog 
        open={qrDialogOpen} 
        onClose={() => setQrDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Digital ID QR Code
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {data?.idNumber}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ 
          textAlign: 'center', 
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <Box 
            sx={{ 
              p: 4, 
              bgcolor: 'white', 
              borderRadius: 3, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #e0e0e0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              mb: 3
            }}
          >
            <QRCode 
              value={data?.idNumber || 'Digital ID'} 
              size={250}
              level="M"
              renderAs="svg"
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
            Scan this QR code to verify the digital identity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The QR code contains encrypted identity information that can be verified by authorized systems
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          gap: 2, 
          pb: 3,
          px: 3
        }}>
          <Button 
            variant="outlined" 
            onClick={() => setQrDialogOpen(false)}
            sx={{ minWidth: 120 }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleDownload}
            startIcon={<DownloadIcon />}
            sx={{ minWidth: 120 }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}