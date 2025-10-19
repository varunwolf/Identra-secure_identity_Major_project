import { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Fingerprint as FingerprintIcon,
  AdminPanelSettings as AdminIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    updateUser({ ...user, ...formData })
    setEditMode(false)
    toast.success('Profile updated successfully!')
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || ''
      }
    })
    setEditMode(false)
  }

  const SecurityFeature = ({ title, description, enabled, icon, onToggle }) => (
    <ListItem>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={title}
        secondary={description}
      />
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={onToggle}
            color="primary"
          />
        }
        label=""
      />
    </ListItem>
  )

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Profile Settings
          </Typography>
          <Button
            variant={editMode ? "outlined" : "contained"}
            startIcon={editMode ? <CancelIcon /> : <EditIcon />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '2px solid',
                      borderColor: 'primary.main',
                      mx: 'auto'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.role === 'admin' ? 'Administrator' : 'User'}
                    color={user?.role === 'admin' ? 'secondary' : 'primary'}
                    icon={user?.role === 'admin' ? <AdminIcon /> : <SecurityIcon />}
                    sx={{ mb: 2 }}
                  />
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Security Features
                  </Typography>
                  <List>
                    <SecurityFeature
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security"
                      enabled={user?.twoFactorEnabled || false}
                      icon={<SecurityIcon color="primary" />}
                      onToggle={() => toast('2FA setup coming soon!')}
                    />
                    <SecurityFeature
                      title="Biometric Login"
                      description="Use fingerprint or face recognition"
                      enabled={user?.biometricEnabled || false}
                      icon={<FingerprintIcon color="primary" />}
                      onToggle={() => toast('Biometric setup coming soon!')}
                    />
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Personal Information
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <SecurityIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Address Information
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        disabled={!editMode}
                        InputProps={{
                          startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="City"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="State/Province"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ZIP/Postal Code"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Country"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Security Features Section */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Security Features
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                          <Typography variant="h6" gutterBottom>
                            Two-Factor Authentication
                          </Typography>
                          <Chip 
                            label={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'} 
                            color={user?.twoFactorEnabled ? 'success' : 'default'}
                            sx={{ mb: 2 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.location.href = '/settings'}
                          >
                            {user?.twoFactorEnabled ? 'Manage' : 'Setup'} 2FA
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <FingerprintIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                          <Typography variant="h6" gutterBottom>
                            Biometric Login
                          </Typography>
                          <Chip 
                            label={user?.biometricEnabled ? 'Enabled' : 'Disabled'} 
                            color={user?.biometricEnabled ? 'success' : 'default'}
                            sx={{ mb: 2 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => window.location.href = '/settings'}
                          >
                            {user?.biometricEnabled ? 'Manage' : 'Setup'} Biometric
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

    </Box>
  )
}

