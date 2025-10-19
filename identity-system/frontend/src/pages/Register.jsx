import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Security,
  Fingerprint,
  CheckCircle
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext.jsx'

const steps = ['Account Details', 'Security Setup', 'Complete Registration']

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { darkMode } = useCustomTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'acceptTerms' ? checked : value
    }))
    setError('')
  }

  const handleNext = () => {
    if (activeStep === 0) {
      // Only check name and email for step 0
      if (!formData.name || !formData.email) {
        setError('Please fill in all required fields')
        return
      }
    }
    if (activeStep === 1) {
      // Check password fields for step 1
      if (!formData.password) {
        setError('Please enter a password')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    if (activeStep === 2) {
      if (!formData.acceptTerms) {
        setError('Please accept the terms and conditions')
        return
      }
    }
    setError('')
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth
      })
      
      if (result.success) {
      navigate('/')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Phone Number (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Date of Birth (Optional)"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        )
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#1976d2', textDecoration: 'none' }}>
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" style={{ color: '#1976d2', textDecoration: 'none' }}>
                    Privacy Policy
                  </Link>
                </Typography>
              }
            />
          </Box>
        )
      case 2:
        return (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Ready to Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your account will be created with the following details:
            </Typography>
            <Card sx={{ textAlign: 'left', mb: 3 }}>
              <CardContent>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Name:</strong> {formData.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Email:</strong> {formData.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {formData.phone || 'Not provided'}
                </Typography>
                <Typography variant="body2">
                  <strong>Date of Birth:</strong> {formData.dateOfBirth || 'Not provided'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Security sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              </motion.div>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Create Your Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join Identra for secure identity management
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#1976d2',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Paper>

          <Card sx={{ mt: 3, bgcolor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="white">
                Secure • Fast • Trusted
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </motion.div>
    </Box>
  )
}