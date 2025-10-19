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
  Chip,
  Divider,
  IconButton
} from '@mui/material'
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  Fingerprint as FingerprintIcon,
  Verified as VerifiedIcon,
  Description as DescriptionIcon
} from '@mui/icons-material'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function DocumentViewer({ 
  open, 
  onClose, 
  document,
  onDownload 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDownload = async () => {
    if (!document) return

    setLoading(true)
    setError('')

    try {
      const documentId = document._id || document.id
      const response = await axios.get(`${API_BASE}/documents/${documentId}/download`, {
        responseType: 'blob'
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
      onClose()
    } catch (error) {
      console.error('Download error:', error)
      if (error.response?.status === 401) {
        setError('Biometric authentication required to view this document')
      } else {
        setError('Failed to download document')
      }
    } finally {
      setLoading(false)
    }
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
          <DescriptionIcon sx={{ mr: 1 }} />
          Document Viewer
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {document.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {document.documentType}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Upload Date
                </Typography>
                <Typography variant="body1">
                  {document.uploadDate ? new Date(document.uploadDate).toLocaleDateString() : 'Unknown'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Expiry Date
                </Typography>
                <Typography variant="body1">
                  {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'No expiry'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  File Size
                </Typography>
                <Typography variant="body1">
                  {document.fileSize || 'Unknown'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={document.expiryDate && new Date(document.expiryDate) < new Date() ? 'Expired' : 'Valid'}
                  color={document.expiryDate && new Date(document.expiryDate) < new Date() ? 'error' : 'success'}
                  size="small"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              <Chip 
                icon={<SecurityIcon />} 
                label="Encrypted" 
                color="primary" 
                size="small" 
              />
              <Chip 
                icon={<VerifiedIcon />} 
                label="Verified" 
                color="success" 
                size="small" 
              />
            </Box>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This document is securely encrypted and stored. Click download to access it.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleDownload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <DownloadIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? 'Downloading...' : 'Download Document'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
