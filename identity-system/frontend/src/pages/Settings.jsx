import { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Paper
} from '@mui/material'
import TwoFactorSetup from '../components/TwoFactorSetup.jsx'
import BiometricAuth from '../components/BiometricAuth.jsx'
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Fingerprint as FingerprintIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { darkMode, toggleTheme } = useCustomTheme()
  const [settings, setSettings] = useState({
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      sms: user?.preferences?.notifications?.sms ?? false
    },
    theme: darkMode ? 'dark' : 'light',
    language: user?.preferences?.language || 'en',
    security: {
      twoFactor: user?.twoFactorEnabled || false,
      biometric: user?.biometricEnabled || false,
      sessionTimeout: 30
    }
  })
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false)
  const [biometricDialogOpen, setBiometricDialogOpen] = useState(false)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long')
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    }
  }


  const handleSaveSettings = () => {
    // Here you would make an API call to save settings
    updateUser({
      ...user,
      preferences: {
        notifications: settings.notifications,
        theme: settings.theme,
        language: settings.language
      }
    })
    toast.success('Settings saved successfully!')
  }

  const handleTwoFactorSuccess = () => {
    updateUser({ ...user, twoFactorEnabled: true })
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, twoFactor: true }
    }))
  }

  const handleBiometricSuccess = () => {
    updateUser({ ...user, biometricEnabled: true })
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, biometric: true }
    }))
  }


  const SettingItem = ({ title, description, icon, children }) => (
    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mb: 2 }}>
        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>{icon}</ListItemIcon>
        <ListItemText
          primary={title}
          secondary={description}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ width: '100%', pl: 5 }}>
        {children}
      </Box>
    </ListItem>
  )

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
          Settings & Preferences
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Notifications
                  </Typography>
                  <List>
                    <SettingItem
                      title="Email Notifications"
                      description="Receive updates via email"
                      icon={<EmailIcon color="primary" />}
                    >
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                        color="primary"
                      />
                    </SettingItem>
                    <SettingItem
                      title="Push Notifications"
                      description="Browser and mobile notifications"
                      icon={<NotificationsIcon color="primary" />}
                    >
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                        color="primary"
                      />
                    </SettingItem>
                    <SettingItem
                      title="SMS Notifications"
                      description="Text message alerts"
                      icon={<PhoneIcon color="primary" />}
                    >
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                        color="primary"
                      />
                    </SettingItem>
                  </List>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <PaletteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Appearance
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={settings.theme}
                          onChange={(e) => {
                            const newTheme = e.target.value
                            handleSettingChange('preferences', 'theme', newTheme)
                            if (newTheme === 'dark' && !darkMode) {
                              toggleTheme()
                            } else if (newTheme === 'light' && darkMode) {
                              toggleTheme()
                            }
                          }}
                          label="Theme"
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="auto">Auto (System)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                          label="Language"
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Español</MenuItem>
                          <MenuItem value="fr">Français</MenuItem>
                          <MenuItem value="de">Deutsch</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Security Settings
                  </Typography>
                  <List>
                    <SettingItem
                      title="Two-Factor Authentication"
                      description="Add an extra layer of security to protect your account"
                      icon={<LockIcon color="primary" />}
                    >
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip 
                            label={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'} 
                            color={user?.twoFactorEnabled ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Button
                          size="medium"
                          variant={user?.twoFactorEnabled ? "outlined" : "contained"}
                          onClick={() => setTwoFactorDialogOpen(true)}
                          startIcon={<SecurityIcon />}
                          sx={{ px: 3 }}
                        >
                          {user?.twoFactorEnabled ? 'Manage' : 'Setup'} 2FA
                        </Button>
                      </Box>
                    </SettingItem>
                    <SettingItem
                      title="Biometric Login"
                      description="Use fingerprint or face recognition for secure access"
                      icon={<FingerprintIcon color="primary" />}
                    >
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Chip 
                            label={user?.biometricEnabled ? 'Enabled' : 'Disabled'} 
                            color={user?.biometricEnabled ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                        <Button
                          size="medium"
                          variant={user?.biometricEnabled ? "outlined" : "contained"}
                          onClick={() => setBiometricDialogOpen(true)}
                          startIcon={<FingerprintIcon />}
                          sx={{ px: 3 }}
                        >
                          {user?.biometricEnabled ? 'Manage' : 'Setup'} Biometric
                        </Button>
                      </Box>
                    </SettingItem>
                  </List>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Change Password
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    >
                      Change Password
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Account Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <AdminIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Account Type"
                        secondary={user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                      />
                      <Chip
                        label={user?.role === 'admin' ? 'Admin' : 'User'}
                        color={user?.role === 'admin' ? 'secondary' : 'primary'}
                        size="small"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email Status"
                        secondary={user?.isEmailVerified ? 'Verified' : 'Unverified'}
                      />
                      <Chip
                        label={user?.isEmailVerified ? 'Verified' : 'Unverified'}
                        color={user?.isEmailVerified ? 'success' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            sx={{ px: 4 }}
          >
            Save All Settings
          </Button>
        </Box>
      </motion.div>

      <TwoFactorSetup
        open={twoFactorDialogOpen}
        onClose={() => setTwoFactorDialogOpen(false)}
        onSuccess={handleTwoFactorSuccess}
      />

      <BiometricAuth
        open={biometricDialogOpen}
        onClose={() => setBiometricDialogOpen(false)}
        onSuccess={handleBiometricSuccess}
      />
    </Box>
  )
}

