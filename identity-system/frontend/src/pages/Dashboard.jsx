import { useQuery } from '@tanstack/react-query'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material'
import {
  Description as DocumentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext.jsx'

const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
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

const ActivityItem = ({ activity }) => (
  <ListItem sx={{ px: 0 }}>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
        {activity.type === 'document' ? <DocumentIcon /> : <SecurityIcon />}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={activity.message}
      secondary={format(new Date(activity.createdAt), 'MMM dd, yyyy • h:mm a')}
    />
    <ListItemSecondaryAction>
      <Chip
        label={activity.type}
        size="small"
        color={activity.type === 'document' ? 'primary' : 'secondary'}
        variant="outlined"
      />
    </ListItemSecondaryAction>
  </ListItem>
)

export default function Dashboard() {
  const { user } = useAuth()

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/dashboard/stats')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          Loading dashboard...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load dashboard data. Please try again.
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your identity documents today.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Documents"
              value={stats?.documents || 0}
              icon={<DocumentIcon />}
              color="primary.main"
              trend="+2 this week"
              subtitle="All uploaded files"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Expiring Soon"
              value={stats?.expiringSoon || 0}
              icon={<WarningIcon />}
              color="warning.main"
              trend="7 days"
              subtitle="Need attention"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Valid Documents"
              value={stats?.validDocuments || 0}
              icon={<CheckIcon />}
              color="success.main"
              trend="98% valid"
              subtitle="In good standing"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Security Score"
              value="95%"
              icon={<SecurityIcon />}
              color="info.main"
              trend="Excellent"
              subtitle="Your security level"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Recent Activity
                    </Typography>
                  </Box>
                  <List>
                    {stats?.recentActivities?.map((activity, index) => (
                      <motion.div
                        key={activity._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <ActivityItem activity={activity} />
                        {index < stats.recentActivities.length - 1 && <Divider />}
                      </motion.div>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Profile Status
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2, width: 40, height: 40 }}>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={user?.role === 'admin' ? 'Administrator' : 'User'}
                    color={user?.role === 'admin' ? 'secondary' : 'primary'}
                    icon={user?.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Account verified and secure
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SecurityIcon sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
                      Security Status
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Two-Factor Authentication
                      </Typography>
                      <Chip 
                        label={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'} 
                        color={user?.twoFactorEnabled ? 'success' : 'default'}
                        size="small"
                        sx={{ color: 'white' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Biometric Login
                      </Typography>
                      <Chip 
                        label={user?.biometricEnabled ? 'Enabled' : 'Disabled'} 
                        color={user?.biometricEnabled ? 'success' : 'default'}
                        size="small"
                        sx={{ color: 'white' }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  )
}

