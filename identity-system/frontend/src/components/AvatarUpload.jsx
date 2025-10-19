import { useState, useRef } from 'react'
import {
  Avatar,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Alert
} from '@mui/material'
import {
  PhotoCamera,
  Delete,
  Upload
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export default function AvatarUpload({ 
  currentAvatar, 
  onAvatarChange, 
  size = 64,
  editable = true 
}) {
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: !editable
  })

  const handleUpload = async () => {
    if (!preview) return

    setUploading(true)
    try {
      // Convert data URL to blob
      const response = await fetch(preview)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('avatar', blob, 'avatar.jpg')

      const uploadResponse = await axios.post(`${API_BASE}/auth/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      onAvatarChange(uploadResponse.data.avatarUrl)
      setOpen(false)
      setPreview(null)
      toast.success('Avatar updated successfully!')
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      await axios.delete(`${API_BASE}/auth/avatar`)
      onAvatarChange(null)
      setOpen(false)
      setPreview(null)
      toast.success('Avatar removed successfully!')
    } catch (error) {
      console.error('Avatar removal error:', error)
      toast.error('Failed to remove avatar')
    }
  }

  const handleOpen = () => {
    if (editable) {
      setOpen(true)
    }
  }

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={currentAvatar ? (currentAvatar.startsWith('http') ? currentAvatar : `${API_BASE.replace('/api', '')}${currentAvatar}`) : null}
          sx={{ 
            width: size, 
            height: size,
            cursor: editable ? 'pointer' : 'default',
            border: '2px solid',
            borderColor: 'primary.main'
          }}
          onClick={handleOpen}
        >
          {!currentAvatar && <PhotoCamera />}
        </Avatar>
        
        {editable && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
            onClick={handleOpen}
          >
            <PhotoCamera fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Avatar</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                cursor: 'pointer',
                bgcolor: isDragActive ? 'primary.light' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                }
              }}
            >
              <input {...getInputProps()} />
              <Upload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select a file
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                PNG, JPG, GIF up to 5MB
              </Typography>
            </Box>

            {preview && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Preview:
                </Typography>
                <Avatar
                  src={preview}
                  sx={{ width: 100, height: 100, mx: 'auto' }}
                />
              </Box>
            )}

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Uploading avatar...
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          {currentAvatar && (
            <Button 
              onClick={handleRemove} 
              color="error" 
              disabled={uploading}
            >
              <Delete sx={{ mr: 1 }} />
              Remove
            </Button>
          )}
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={!preview || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
