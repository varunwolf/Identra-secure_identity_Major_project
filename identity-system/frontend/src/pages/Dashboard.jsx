import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    async function run() {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setStats(json)
    }
    run()
  }, [])

  if (!stats) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 900, margin: '20px auto' }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <div style={{ color: '#666', fontSize: 12 }}>Documents</div>
          <div style={{ fontSize: 28 }}>{stats.documents}</div>
        </div>
        <div style={{ flex: 1, border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <div style={{ color: '#666', fontSize: 12 }}>Expiring (7 days)</div>
          <div style={{ fontSize: 28 }}>{stats.expiringSoon}</div>
        </div>
      </div>
      <h3 style={{ marginTop: 24 }}>Recent Activity</h3>
      <ul>
        {stats.recentActivities.map(a => (
          <li key={a._id}>{new Date(a.createdAt).toLocaleString()} - {a.message}</li>
        ))}
      </ul>
    </div>
  )
}

