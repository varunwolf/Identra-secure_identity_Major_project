import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function DigitalID() {
  const [data, setData] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(() => {
    async function run() {
      const res = await fetch(`${API_BASE}/digital-id`, { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setData(json)
    }
    run()
  }, [])

  if (!data) return <div style={{ padding: 20 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 480, margin: '20px auto', border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Digital ID</h3>
      <div><strong>ID Number:</strong> {data.idNumber}</div>
      <div style={{ marginTop: 12 }}>
        <img src={data.qrDataUrl} alt="QR Code" style={{ width: 220, height: 220 }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: '#555' }}>Issued at: {new Date(data.issuedAt).toLocaleString()}</div>
    </div>
  )
}

