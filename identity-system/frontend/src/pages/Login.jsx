import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem('token', data.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email<br />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password<br />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
          </label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  )
}

