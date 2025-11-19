import { notFound } from 'next/navigation'
import Link from 'next/link'

const API_BASE = 'https://tinyurlbackend-s5tm.onrender.com'

export default async function StatsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params // ← THIS LINE FIXES THE ERROR

  let link
  try {
    const res = await fetch(`${API_BASE}/api/links/${code}`, { cache: 'no-store' })
    if (!res.ok) throw new Error()
    link = await res.json()
  } catch {
    notFound()
  }

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
    <div className="w-full max-w-lg flex flex-col gap-4">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-indigo-600 text-center mb-6">
        Link Statistics
      </h1>

      {/* BOX 1 – Short Code */}
      <div className="border border-gray-400 p-4 bg-white shadow-sm rounded-lg">
        <strong className="text-black">Short Code:</strong>
        <div className="mt-1 font-mono text-indigo-700 text-lg">{link.code}</div>
      </div>

      {/* BOX 2 – URL */}
      <div className="border border-gray-400 p-4 bg-white shadow-sm rounded-lg">
        <strong className="text-black">URL:</strong>
        <div className="mt-1 break-words text-blue-600 underline">
          <a href={link.url} target="_blank">{link.url}</a>
        </div>
      </div>

      {/* BOX 3 – Total Clicks */}
      <div className="border border-gray-400 p-4 bg-white shadow-sm rounded-lg">
        <strong className="text-black">Total Clicks:</strong>
        <div className="mt-1 text-indigo-600 font-bold text-2xl">{link.clicks}</div>
      </div>

      {/* BOX 4 – Last Clicked */}
      <div className="border border-gray-400 p-4 bg-white shadow-sm rounded-lg">
        <strong className="text-black">Last Clicked:</strong>
        <div className="mt-1 text-gray-700">
          {link.last_clicked ? new Date(link.last_clicked).toLocaleString() : "Never"}
        </div>
      </div>

      {/* BOX 5 – Created At */}
      <div className="border border-gray-400 p-4 bg-white shadow-sm rounded-lg">
        <strong className="text-black">Created At:</strong>
        <div className="mt-1 text-gray-700">
          {new Date(link.created_at).toLocaleString()}
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="text-center mt-6">
        <a
          href="/"
          className="px-10 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition"
        >
          ← Back to Dashboard
        </a>
      </div>

    </div>
  </div>
);



}