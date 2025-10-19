import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider
} from '@mui/material'
import {
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon,
  Verified as VerifiedIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function BiometricDocumentViewer({ 
  open, 
  onClose, 
  document, 
  onAuthenticated 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const handleBiometricAuth = async () => {
    setLoading(true)
    setError('')

    try {
      // Check if biometric authentication is available
      if (!navigator.credentials) {
        throw new Error('Biometric authentication not supported on this device')
      }

      // Begin biometric authentication
      const authResponse = await axios.post(`${API_BASE}/auth/biometric/authenticate/begin`)
      const options = authResponse.data

      // Convert base64url to ArrayBuffer
      const challenge = base64urlToArrayBuffer(options.challenge)
      const allowCredentials = options.allowCredentials.map(cred => ({
        ...cred,
        id: base64urlToArrayBuffer(cred.id)
      }))

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          allowCredentials: allowCredentials,
          timeout: 60000,
          userVerification: 'required'
        }
      })

      // Convert credential to base64url
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          authenticatorData: arrayBufferToBase64url(credential.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
          signature: arrayBufferToBase64url(credential.response.signature)
        },
        type: credential.type
      }

      // Complete authentication
      await axios.post(`${API_BASE}/auth/biometric/authenticate/complete`, credentialData)
      
      setAuthenticated(true)
      toast.success('Biometric authentication successful!')
      
      // Call the parent callback with authentication success
      if (onAuthenticated) {
        onAuthenticated()
      }
    } catch (error) {
      console.error('Biometric authentication error:', error)
      if (error.name === 'NotAllowedError') {
        setError('Biometric authentication was cancelled or not allowed')
      } else if (error.name === 'NotSupportedError') {
        setError('Biometric authentication is not supported on this device')
      } else {
        setError('Biometric authentication failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!document) return

    const documentId = document._id || document.id
    if (!documentId) {
      console.error('Document ID not found:', document)
      return
    }

    try {
      const response = await axios.get(`${API_BASE}/documents/${documentId}/download`, {
        responseType: 'blob',
        headers: {
          'X-Biometric-Auth': 'true' // Special header to indicate biometric authentication
        }
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = window.document.createElement('a')
      link.href = url
      link.setAttribute('download', document.filename || document.originalFilename)
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Document downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }

  // Utility functions for base64url conversion
  const base64urlToArrayBuffer = (base64url) => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  const arrayBufferToBase64url = (buffer) => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64 = btoa(binary)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  if (!document) return null

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Secure Document Access
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!authenticated ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FingerprintIcon sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
            
            <Typography variant="h5" gutterBottom>
              Biometric Authentication Required
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              This document requires biometric authentication for secure access.
            </Typography>

            <Card sx={{ mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Document Details
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <DownloadIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {document.filename}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {document.documentType}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<SecurityIcon />} 
                    label="Protected" 
                    color="warning" 
                    size="small" 
                  />
                  <Chip 
                    icon={<FingerprintIcon />} 
                    label="Biometric Required" 
                    color="primary" 
                    size="small" 
                  />
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={handleBiometricAuth}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <FingerprintIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              {loading ? 'Authenticating...' : 'Authenticate with Biometrics'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <VerifiedIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            
            <Typography variant="h5" gutterBottom color="success.main">
              Authentication Successful!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              You can now access the protected document.
            </Typography>

            <Card sx={{ mb: 3, textAlign: 'left' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Document Access Granted
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <DownloadIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {document.filename}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {document.documentType} • {document.fileSize || 'Unknown size'}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<VerifiedIcon />} 
                    label="Authenticated" 
                    color="success" 
                    size="small" 
                  />
                  <Chip 
                    icon={<SecurityIcon />} 
                    label="Secure Access" 
                    color="primary" 
                    size="small" 
                  />
                </Box>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              size="large"
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              Download Document
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
