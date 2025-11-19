import { redirect } from 'next/navigation'

const API_BASE = 'https://tinyurlbackend-s5tm.onrender.com'

export default async function RedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params // ← THIS LINE FIXES THE ERROR

  try {
    const res = await fetch(`${API_BASE}/api/links/${code}`, { cache: 'no-store' })
    if (!res.ok) throw new Error()
    const data = await res.json()
    redirect(data.url)
  } catch {
    redirect('/?error=notfound')
  }
}