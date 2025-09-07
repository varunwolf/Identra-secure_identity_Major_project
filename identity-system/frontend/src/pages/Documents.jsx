import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [file, setFile] = useState(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  async function fetchDocs() {
    const res = await fetch(`${API_BASE}/documents`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setDocs(data)
  }

  useEffect(() => { fetchDocs() }, [])

  async function upload() {
    if (!file) return
    setError('')
    const form = new FormData()
    form.append('file', file)
    if (expiryDate) form.append('expiryDate', expiryDate)
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.message || 'Upload failed')
    }
    setFile(null)
    setExpiryDate('')
    await fetchDocs()
  }

  async function download(id, name) {
    const res = await fetch(`${API_BASE}/documents/${id}/download`, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  async function removeDoc(id) {
    await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    await fetchDocs()
  }

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h2>Documents</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ margin: '12px 0' }}>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} style={{ marginLeft: 8 }} />
        <button onClick={upload} style={{ marginLeft: 8 }}>Upload</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Type</th>
            <th align="left">Size</th>
            <th align="left">Expiry</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(d => (
            <tr key={d.id}>
              <td>{d.originalFilename}</td>
              <td>{d.mimeType}</td>
              <td>{Math.round(d.size/1024)} KB</td>
              <td>{d.expiryDate ? new Date(d.expiryDate).toDateString() : '-'}</td>
              <td>
                <button onClick={() => download(d.id, d.originalFilename)}>Download</button>
                <button onClick={() => removeDoc(d.id)} style={{ marginLeft: 6 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

