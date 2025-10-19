import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import BiometricDocumentViewer from '../components/BiometricDocumentViewer.jsx'
import DocumentViewer from '../components/DocumentViewer.jsx'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
  Tooltip,
  Badge
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Description as DocumentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

const DocumentCard = ({ document, onDownload, onDelete, onView, onViewDocument, onViewDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const getStatusColor = (expiryDate) => {
    if (!expiryDate) return 'default'
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'error'
    if (daysUntilExpiry <= 7) return 'warning'
    if (daysUntilExpiry <= 30) return 'info'
    return 'success'
  }

  const getStatusText = (expiryDate) => {
    if (!expiryDate) return 'No expiry'
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return 'Expired'
    if (daysUntilExpiry <= 7) return 'Expires soon'
    if (daysUntilExpiry <= 30) return 'Expires in 30 days'
    return 'Valid'
  }

  const getStatusIcon = (expiryDate) => {
    if (!expiryDate) return <CheckIcon />
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) return <WarningIcon />
    if (daysUntilExpiry <= 7) return <WarningIcon />
    if (daysUntilExpiry <= 30) return <ScheduleIcon />
    return <CheckIcon />
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'visible',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          '& .document-actions': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'primary.50', 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DocumentIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  flex: 1, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  color: 'text.primary'
                }}>
                  {document.originalFilename || document.filename}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={handleMenuClick} 
                  sx={{ 
                    flexShrink: 0,
                    bgcolor: 'grey.100',
                    '&:hover': {
                      bgcolor: 'grey.200'
                    }
                  }}
                >
                  <MoreIcon />
                </IconButton>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 16, mr: 1 }} />
                Uploaded {document.createdAt ? format(new Date(document.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                {document.size && (
                  <span> • {(document.size / 1024 / 1024).toFixed(2)} MB</span>
                )}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={getStatusIcon(document.expiryDate)}
                  label={getStatusText(document.expiryDate)}
                  color={getStatusColor(document.expiryDate)}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
                <Chip
                  label={document.documentType || 'Document'}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
              
              {document.expiryDate && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  <WarningIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Expires: {format(new Date(document.expiryDate), 'MMM dd, yyyy')}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ 
            mt: 'auto', 
            pt: 2,
            opacity: 0,
            transform: 'translateY(10px)',
            transition: 'all 0.3s ease',
            '&.document-actions': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }} className="document-actions">
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => { onViewDetails(document); handleMenuClose(); }}
                sx={{ 
                  minWidth: 'auto',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                View
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => { onViewDocument(document); handleMenuClose(); }}
                sx={{ 
                  minWidth: 'auto',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                  }
                }}
              >
                Download
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { onViewDetails(document); handleMenuClose(); }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onViewDocument(document); handleMenuClose(); }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onDelete(document.id); handleMenuClose(); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </motion.div>
  )
}

const UploadZone = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  })

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        textAlign: 'center',
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        bgcolor: isDragActive ? 'primary.50' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'primary.50'
        }
      }}
    >
      <input {...getInputProps()} />
      <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop your file here' : 'Drag & drop a file here'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        or click to browse files
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
      </Typography>
    </Paper>
  )
}

export default function Documents() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [uploading, setUploading] = useState(false)
  const [biometricViewerOpen, setBiometricViewerOpen] = useState(false)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const queryClient = useQueryClient()

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await axios.get('/documents')
      return response.data
    }
  })

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document uploaded successfully!')
      setUploadDialogOpen(false)
      setSelectedFile(null)
      setExpiryDate('')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload failed')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (documentId) => {
      await axios.delete(`/documents/${documentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete document')
    }
  })

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setUploadDialogOpen(true)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    if (expiryDate) {
      formData.append('expiryDate', expiryDate)
    }

    try {
      await uploadMutation.mutateAsync(formData)
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await axios.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
        headers: {
          'X-Biometric-Auth': 'true' // Add biometric auth header
        }
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Document downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download document')
    }
  }

  const handleViewDocument = (document) => {
    // Always show biometric authentication for document download
    setSelectedDocument(document)
    setBiometricViewerOpen(true)
  }

  const handleBiometricAuthenticated = () => {
    if (selectedDocument) {
      const documentId = selectedDocument._id || selectedDocument.id
      const filename = selectedDocument.filename || selectedDocument.originalFilename
      handleDownload(documentId, filename)
      setBiometricViewerOpen(false)
      setSelectedDocument(null)
    }
  }

  const handleViewDetails = (document) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }

  const handleDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId)
    }
  }

  const handleView = (document) => {
    // Implement document viewer
    toast.info('Document viewer coming soon!')
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading documents...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load documents. Please try again.
      </Alert>
    )
  }

  const expiringSoon = documents?.filter(doc => {
    if (!doc.expiryDate) return false
    const expiry = new Date(doc.expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0
  }).length || 0

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Document Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload, manage, and track your identity documents
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUploadDialogOpen(true)}
            size="large"
          >
            Upload Document
          </Button>
        </Box>

        {expiringSoon > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              You have {expiringSoon} document{expiringSoon > 1 ? 's' : ''} expiring within 7 days.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {documents?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {expiringSoon}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expiring Soon
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {documents?.filter(doc => {
                    if (!doc.expiryDate) return true
                    const expiry = new Date(doc.expiryDate)
                    return isAfter(expiry, new Date())
                  }).length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valid Documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  <SecurityIcon />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Encrypted Storage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <UploadZone onUpload={handleFileSelect} />

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Your Documents ({documents?.length || 0})
        </Typography>

        <AnimatePresence>
          <Grid container spacing={3}>
            {documents?.map((document) => (
              <Grid item xs={12} sm={6} md={4} key={document.id}>
                <DocumentCard
                  document={document}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onView={handleView}
                  onViewDocument={handleViewDocument}
                  onViewDetails={handleViewDetails}
                />
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>

        {(!documents || documents.length === 0) && (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Upload your first document to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialogOpen(true)}
            >
              Upload Document
            </Button>
          </Paper>
        )}
      </motion.div>

      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selected file: {selectedFile?.name}
            </Typography>
            <TextField
              fullWidth
              label="Expiry Date (Optional)"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <LinearProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <BiometricDocumentViewer
        open={biometricViewerOpen}
        onClose={() => {
          setBiometricViewerOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        onAuthenticated={handleBiometricAuthenticated}
      />

      <DocumentViewer
        open={documentViewerOpen}
        onClose={() => {
          setDocumentViewerOpen(false)
          setSelectedDocument(null)
        }}
        document={selectedDocument}
        onDownload={handleDownload}
      />
    </Box>
  )
}