import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Refresh
} from '@mui/icons-material'
import QRCode from 'qrcode.react'
import axios from 'axios'
import toast from 'react-hot-toast'
import ErrorBoundary from './ErrorBoundary.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function TwoFactorSetup({ open, onClose, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0)
  const [secret, setSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSecret, setShowSecret] = useState(false)

  const steps = [
    'Generate Secret',
    'Verify Setup',
    'Backup Codes'
  ]

  useEffect(() => {
    if (open) {
      generateSecret()
    }
  }, [open])

  const generateSecret = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_BASE}/auth/2fa/generate`)
      setSecret(response.data.secret)
      setQrCodeUrl(response.data.qrCodeUrl)
    } catch (error) {
      setError('Failed to generate 2FA secret')
      console.error('2FA generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_BASE}/auth/2fa/verify`, {
        code: verificationCode
      })
      
      console.log('2FA Response:', response.data)
      setBackupCodes(response.data.backupCodes || [])
      setActiveStep(2)
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setSecret('')
    setQrCodeUrl('')
    setVerificationCode('')
    setBackupCodes([])
    setError('')
    setShowSecret(false)
    onClose()
  }

  const handleComplete = () => {
    onSuccess()
    handleClose()
    toast.success('Two-factor authentication enabled successfully!')
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <SecurityIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Set up Two-Factor Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Scan the QR code with your authenticator app or enter the secret key manually.
            </Typography>

            {loading ? (
              <CircularProgress />
            ) : (
              <Box>
                {secret && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Paper sx={{ p: 2, display: 'inline-block', textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Scan with your authenticator app
                      </Typography>
                      <ErrorBoundary>
                        <QRCode 
                          value={`otpauth://totp/Identra?secret=${secret}&issuer=Identra`}
                          size={120}
                          level="L"
                          renderAs="svg"
                        />
                      </ErrorBoundary>
                    </Paper>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Secret Key"
                  value={secret}
                  type={showSecret ? 'text' : 'password'}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowSecret(!showSecret)}
                          edge="end"
                        >
                          {showSecret ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2" color="text.secondary">
                  Use apps like Google Authenticator, Authy, or Microsoft Authenticator
                </Typography>
              </Box>
            )}
          </Box>
        )

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Verify Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the 6-digit code from your authenticator app to verify the setup.
            </Typography>

            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
              <Typography variant="h6">
                Setup Complete!
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold">
                Save these backup codes in a secure location!
              </Typography>
              <Typography variant="body2">
                You can use these codes to access your account if you lose your authenticator device.
              </Typography>
            </Alert>

            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Backup Codes (6 codes):
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {backupCodes.map((code, index) => (
                  <Box key={index} sx={{ 
                    p: 1, 
                    bgcolor: 'white', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                      {code}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Two-Factor Authentication
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        
        {activeStep === 0 && (
          <Button 
            onClick={() => setActiveStep(1)} 
            variant="contained"
            disabled={!secret}
          >
            Next
          </Button>
        )}
        
        {activeStep === 1 && (
          <Button 
            onClick={verifySetup} 
            variant="contained"
            disabled={loading || !verificationCode}
          >
            {loading ? <CircularProgress size={20} /> : 'Verify'}
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button 
            onClick={handleComplete} 
            variant="contained"
            color="success"
          >
            Complete Setup
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
