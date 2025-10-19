import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, Box, ThemeProvider as MuiThemeProvider, CircularProgress } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Documents from './pages/Documents.jsx'
import DigitalID from './pages/DigitalID.jsx'
import Admin from './pages/Admin.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function PrivateRoute({ children, adminOnly = false }) {
  const { user, token, loading } = useAuth()
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    )
  }
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/documents" element={
        <PrivateRoute>
          <Layout>
            <Documents />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/digital-id" element={
        <PrivateRoute>
          <Layout>
            <DigitalID />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <Settings />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute adminOnly>
          <Layout>
            <Admin />
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  )
}

function AppContent() {
  const { theme } = useTheme()
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4caf50',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#f44336',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
