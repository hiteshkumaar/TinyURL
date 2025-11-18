import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [links, setLinks] = useState([]);
  const [message, setMessage] = useState(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || '';

  const fetchLinks = async () => {
    const res = await axios.get(`${apiBase}/api/links`);
    setLinks(res.data);
  };

  useEffect(() => { fetchLinks(); }, []);

  const createLink = async () => {
    try {
      const res = await axios.post(`${apiBase}/api/links`, { url, code: code || undefined });
      setMessage({ type: 'success', text: `Short link created: ${res.data.code}` });
      setUrl(''); setCode('');
      fetchLinks();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error' });
    }
  };

  const delLink = async (c) => {
    await axios.delete(`${apiBase}/api/links/${c}`);
    fetchLinks();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>TinyLink</h1>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="https://example.com/long-url" value={url} onChange={e=>setUrl(e.target.value)} style={{ width: '60%', marginRight: 8 }} />
        <input placeholder="custom code (optional)" value={code} onChange={e=>setCode(e.target.value)} style={{ width: '20%', marginRight: 8 }} />
        <button onClick={createLink}>Create</button>
      </div>
      {message && <div style={{color: message.type==='error'?'red':'green'}}>{message.text}</div>}
      <h2>Links</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Code</th><th>URL</th><th>Clicks</th><th>Last Clicked</th><th>Action</th></tr></thead>
        <tbody>
          {links.map(l=>(
            <tr key={l.code}>
              <td><a href={`/${l.code}`} target="_blank" rel="noreferrer">{l.code}</a></td>
              <td style={{maxWidth:400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{l.url}</td>
              <td>{l.clicks}</td>
              <td>{l.last_clicked || '-'}</td>
              <td><button onClick={()=>delLink(l.code)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}