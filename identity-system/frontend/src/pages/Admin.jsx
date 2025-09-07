import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [docs, setDocs] = useState([])
  const token = localStorage.getItem('token')

  async function load() {
    const [u, d] = await Promise.all([
      fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/admin/documents`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
    setUsers(u)
    setDocs(d)
  }

  useEffect(() => { load() }, [])

  async function elevate(userId) {
    await fetch(`${API_BASE}/admin/elevate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId })
    })
    await load()
  }

  return (
    <div style={{ maxWidth: 1000, margin: '20px auto' }}>
      <h2>Admin</h2>
      <h3>Users</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th align="left">Name</th><th align="left">Email</th><th align="left">Role</th><th>Action</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.role !== 'admin' && <button onClick={() => elevate(u._id)}>Make admin</button>}</td></tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ marginTop: 24 }}>All Documents</h3>
      <ul>
        {docs.map(d => (
          <li key={d._id}>{d.originalFilename} - {d.owner?.email}</li>
        ))}
      </ul>
    </div>
  )
}

