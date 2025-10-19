import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Description as DocumentIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
  Shield as ShieldIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
            <Typography variant="caption" color="success.main">
              {trend}
            </Typography>
          </Box>
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

const UserRow = ({ user, onElevate, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={user.role}
          color={user.role === 'admin' ? 'secondary' : 'primary'}
          size="small"
          icon={user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={user.isActive ? 'Active' : 'Inactive'}
          color={user.isActive ? 'success' : 'default'}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onElevate(user._id); handleMenuClose(); }}>
            <ListItemIcon>
              <ShieldIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Elevate to Admin</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { onDelete(user._id); handleMenuClose(); }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  )
}

const DocumentRow = ({ document }) => (
  <TableRow>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <DocumentIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="body2" noWrap>
          {document.originalFilename}
        </Typography>
      </Box>
    </TableCell>
    <TableCell>
      <Typography variant="body2">
        {document.owner?.email || document.userId}
      </Typography>
    </TableCell>
    <TableCell>
      <Typography variant="body2">
        {format(new Date(document.uploadDate), 'MMM dd, yyyy')}
      </Typography>
    </TableCell>
    <TableCell>
      <Chip
        label={document.expiryDate ? 'Has Expiry' : 'No Expiry'}
        color={document.expiryDate ? 'info' : 'default'}
        size="small"
      />
    </TableCell>
    <TableCell>
      <Typography variant="body2">
        {Math.round(document.size / 1024)} KB
      </Typography>
    </TableCell>
  </TableRow>
)

export default function Admin() {
  const [tabValue, setTabValue] = useState(0)
  const [elevateDialogOpen, setElevateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const queryClient = useQueryClient()

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await axios.get('/admin/users')
      return response.data
    }
  })

  const { data: documents, isLoading: documentsLoading, error: documentsError } = useQuery({
    queryKey: ['admin-documents'],
    queryFn: async () => {
      const response = await axios.get('/admin/documents')
      return response.data
    }
  })

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await axios.get('/admin/stats')
      return response.data
    }
  })

  const elevateMutation = useMutation({
    mutationFn: async (userId) => {
      await axios.post('/admin/elevate', { userId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User elevated to admin successfully!')
      setElevateDialogOpen(false)
    },
    onError: () => {
      toast.error('Failed to elevate user')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      await axios.delete(`/admin/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete user')
    }
  })

  const handleElevate = (userId) => {
    setSelectedUser(userId)
    setElevateDialogOpen(true)
  }

  const handleConfirmElevate = () => {
    if (selectedUser) {
      elevateMutation.mutate(selectedUser)
    }
  }

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (usersLoading || documentsLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading admin data...
        </Typography>
      </Box>
    )
  }

  if (usersError || documentsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load admin data. Please try again.
      </Alert>
    )
  }

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
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, documents, and system settings
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-users'] })
                queryClient.invalidateQueries({ queryKey: ['admin-documents'] })
                queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => toast.info('User creation coming soon!')}
            >
              Add User
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || users?.length || 0}
              icon={<PersonIcon />}
              color="primary.main"
              trend="+5 this month"
              subtitle="Registered users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Documents"
              value={stats?.totalDocuments || documents?.length || 0}
              icon={<DocumentIcon />}
              color="info.main"
              trend="+12 this week"
              subtitle="Uploaded files"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={stats?.activeUsers || users?.filter(u => u.isActive).length || 0}
              icon={<CheckCircle />}
              color="success.main"
              trend="98% active"
              subtitle="Currently online"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Health"
              value="99.9%"
              icon={<SecurityIcon />}
              color="warning.main"
              trend="Excellent"
              subtitle="Uptime status"
            />
          </Grid>
        </Grid>

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Users" icon={<PersonIcon />} />
              <Tab label="Documents" icon={<DocumentIcon />} />
              <Tab label="Analytics" icon={<AnalyticsIcon />} />
              <Tab label="Settings" icon={<SettingsIcon />} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    User Management ({users?.length || 0} users)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label="All Users" color="primary" size="small" />
                    <Chip label="Admins" color="secondary" size="small" />
                  </Box>
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Joined</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users?.map((user) => (
                        <UserRow
                          key={user._id}
                          user={user}
                          onElevate={handleElevate}
                          onDelete={handleDeleteUser}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Document Management ({documents?.length || 0} documents)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label="All Documents" color="primary" size="small" />
                    <Chip label="Expiring Soon" color="warning" size="small" />
                  </Box>
                </Box>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Filename</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>Expiry</TableCell>
                        <TableCell>Size</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents?.map((document) => (
                        <DocumentRow key={document._id} document={document} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  System Analytics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          User Growth
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Analytics charts will be implemented here
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Document Statistics
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Document upload trends and analytics
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  System Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Security Settings
                        </Typography>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Enable Two-Factor Authentication"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Enable Biometric Authentication"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Require Strong Passwords"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          System Configuration
                        </Typography>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Email Notifications"
                        />
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label="Document Encryption"
                        />
                        <FormControlLabel
                          control={<Switch />}
                          label="Maintenance Mode"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={elevateDialogOpen} onClose={() => setElevateDialogOpen(false)}>
        <DialogTitle>Elevate User to Admin</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to elevate this user to administrator? 
            This will give them full access to the admin panel.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setElevateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmElevate}
            disabled={elevateMutation.isLoading}
          >
            {elevateMutation.isLoading ? 'Elevating...' : 'Elevate User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}