import { useState, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material'
import {
  Fingerprint as FingerprintIcon,
  Face as FaceIcon,
  Security as SecurityIcon,
  CheckCircle,
  Error,
  Delete,
  Add
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function BiometricAuth({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState([])
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if WebAuthn is supported
    setIsSupported(
      typeof window !== 'undefined' && 
      window.PublicKeyCredential && 
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    )
    
    if (open) {
      fetchCredentials()
    }
  }, [open])

  const fetchCredentials = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/biometric/credentials`)
      setCredentials(response.data.credentials || [])
    } catch (error) {
      console.error('Failed to fetch credentials:', error)
    }
  }

  const registerBiometric = async () => {
    if (!isSupported) {
      setError('Biometric authentication is not supported on this device')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get registration options from server
      const optionsResponse = await axios.post(`${API_BASE}/auth/biometric/register/begin`)
      const options = optionsResponse.data

      // Convert base64url to ArrayBuffer
      const challenge = base64urlToArrayBuffer(options.challenge)
      const userId = base64urlToArrayBuffer(options.user.id)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: options.rp.name,
            id: options.rp.id,
          },
          user: {
            id: userId,
            name: options.user.name,
            displayName: options.user.displayName,
          },
          pubKeyCredParams: options.pubKeyCredParams,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      })

      // Convert credential to base64url
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
          clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON)
        },
        type: credential.type
      }

      // Send credential to server
      await axios.post(`${API_BASE}/auth/biometric/register/complete`, credentialData)
      
      toast.success('Biometric authentication registered successfully!')
      fetchCredentials()
      onSuccess()
    } catch (error) {
      console.error('Biometric registration error:', error)
      if (error.name === 'NotAllowedError') {
        setError('Biometric registration was cancelled or not allowed')
      } else if (error.name === 'NotSupportedError') {
        setError('Biometric authentication is not supported on this device')
      } else {
        setError('Failed to register biometric authentication')
      }
    } finally {
      setLoading(false)
    }
  }

  const authenticateBiometric = async () => {
    if (!isSupported) {
      setError('Biometric authentication is not supported on this device')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get authentication options from server
      const optionsResponse = await axios.post(`${API_BASE}/auth/biometric/authenticate/begin`)
      const options = optionsResponse.data

      // Convert base64url to ArrayBuffer
      const challenge = base64urlToArrayBuffer(options.challenge)
      const allowCredentials = options.allowCredentials?.map(cred => ({
        ...cred,
        id: base64urlToArrayBuffer(cred.id)
      })) || []

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

      // Send credential to server
      const response = await axios.post(`${API_BASE}/auth/biometric/authenticate/complete`, credentialData)
      
      toast.success('Biometric authentication successful!')
      onSuccess(response.data)
    } catch (error) {
      console.error('Biometric authentication error:', error)
      if (error.name === 'NotAllowedError') {
        setError('Biometric authentication was cancelled or not allowed')
      } else if (error.name === 'NotSupportedError') {
        setError('Biometric authentication is not supported on this device')
      } else {
        setError('Biometric authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteCredential = async (credentialId) => {
    try {
      await axios.delete(`${API_BASE}/auth/biometric/credentials/${credentialId}`)
      toast.success('Biometric credential removed successfully!')
      fetchCredentials()
    } catch (error) {
      console.error('Failed to delete credential:', error)
      toast.error('Failed to remove biometric credential')
    }
  }

  // Utility functions for base64url conversion
  const base64urlToArrayBuffer = (base64url) => {
    if (!base64url) {
      console.error('Invalid base64url string:', base64url)
      return new ArrayBuffer(0)
    }
    try {
      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return bytes.buffer
    } catch (error) {
      console.error('Error converting base64url:', error)
      return new ArrayBuffer(0)
    }
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Biometric Authentication
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {!isSupported && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Biometric authentication is not supported on this device or browser.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <FingerprintIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Secure Biometric Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use your fingerprint, face, or other biometric data for secure authentication.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              onClick={registerBiometric}
              disabled={loading || !isSupported}
              startIcon={loading ? <CircularProgress size={20} /> : <Add />}
            >
              Register Biometric
            </Button>
            
            <Button
              variant="outlined"
              onClick={authenticateBiometric}
              disabled={loading || !isSupported || credentials.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <FingerprintIcon />}
            >
              Test Authentication
            </Button>
          </Box>

          {credentials.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Registered Biometric Credentials
              </Typography>
              <List>
                {credentials.map((cred, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FaceIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Biometric Credential ${index + 1}`}
                      secondary={`Created: ${new Date(cred.createdAt).toLocaleDateString()}`}
                    />
                    <IconButton
                      onClick={() => deleteCredential(cred.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
