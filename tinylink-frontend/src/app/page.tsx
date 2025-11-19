'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Copy, ExternalLink, Trash2, Loader2, Link2 } from 'lucide-react'
import Link from 'next/link'

const API_BASE = 'https://tinyurlbackend-s5tm.onrender.com'

export default function Dashboard() {
  const [links, setLinks] = useState<any[]>([])
  const [url, setUrl] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLinks = async () => {
    setFetching(true)
    try {
      const res = await axios.get(`${API_BASE}/api/links`)
      setLinks(res.data)
    } catch {
      toast.error('Failed to load links')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => { fetchLinks() }, [])

  const createLink = async () => {
    if (!url.trim()) return toast.error('Enter a URL')
    if (!/^https?:\/\//i.test(url)) return toast.error('URL must start with http:// or https://')
    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) return toast.error('Code must be 6–8 letters/numbers')

    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/api/links`, { url: url, code: code || undefined })
      toast.success(`Created: ${res.data.code}`)
      setUrl(''); setCode('')
      fetchLinks()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setLoading(false)
    }
  }
const handleLinkClick = async (code:any) => {
  const redirectUrl = `${API_BASE}/${code}`;
  const statsUrl = `/code/${code}`;
  try {
    await axios.get(redirectUrl); 
  } catch (e) {
    console.error("Redirect recording failed", e);
  }

  // 2️⃣ Open stats page
  window.open(statsUrl, "_blank");
};

  const deleteLink = async (c: string) => {
    if (!confirm('Delete this link?')) return
    await axios.delete(`${API_BASE}/api/links/${c}`)
    toast.success('Deleted')
    fetchLinks()
  }

  const copyLink = (c: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${c}`)
    toast.success('Copied!')
  }

  const filtered = links.filter(l =>
    l.code.toLowerCase().includes(search.toLowerCase()) ||
    l.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TinyLink
          </h1>
          <p className="text-xl text-gray-600 mt-4">Shorten • Track • Share</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-10">
          <h2 className="text-2xl font-bold mb-6">Create Short Link</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="px-6 py-4 border-2 rounded-xl focus:border-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder="custom code (optional"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="px-6 py-4 border-2 rounded-xl font-mono"
            />
            <button
              onClick={createLink}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-xl flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Link2 />}
              {loading ? 'Creating...' : 'Shorten'}
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md block mx-auto px-6 py-4 border-2 rounded-xl mb-8"
        />

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {fetching ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={60} /></div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <Link2 size={80} className="mx-auto mb-4 opacity-20" />
              <p className="text-2xl">No links yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-6 font-bold">Code</th>
                  <th className="text-left p-6 font-bold">URL</th>
                  <th className="text-center p-6 font-bold">Clicks</th>
                  <th className="text-center p-6 font-bold">Last Clicked</th>
                  <th className="text-center p-6 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.code} className="border-t hover:bg-gray-50">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <code className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded font-bold">{l.code}</code>
                        <span onClick={() => copyLink(l.code)}><Copy size={18} /></span>
                      </div>
                    </td>
                    <td className="cursor-pointer p-6 text-sm text-gray-600 max-w-md truncate">
                        <a  onClick={() => handleLinkClick(l.code)}>{l.url}</a>
                    </td>
                    <td className="p-6 text-center font-bold text-indigo-600">{l.clicks}</td>
                    <td className="p-6 text-center text-sm">
                      {l.last_clicked ? new Date(l.last_clicked).toLocaleString() : '—'}
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-4">
                        {/* <Link href={`/code/${l.code}`} className="text-indigo-600">
                          <ExternalLink size={20} />
                        </Link> */}
                        <span onClick={() => deleteLink(l.code)} className="text-red-600">
                          <Trash2 size={20} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}