import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Documents from './pages/Documents.jsx'
import DigitalID from './pages/DigitalID.jsx'
import Admin from './pages/Admin.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/documents">Documents</Link>
        <Link to="/digital-id">Digital ID</Link>
        <Link to="/login" onClick={() => { localStorage.removeItem('token'); }}>Logout</Link>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
        <Route path="/digital-id" element={<PrivateRoute><DigitalID /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
