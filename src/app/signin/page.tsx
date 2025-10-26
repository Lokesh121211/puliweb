"use client"
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.error || 'Failed to sign in')
      return
    }
    setOk(true)
    window.location.href = '/chat'
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in to Puli</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-black text-white rounded p-2">Sign In</button>
      </form>
      {err && <p className="text-red-600 mt-3">{err}</p>}
      {ok && <p className="text-green-700 mt-3">Signed in. Redirecting…</p>}
      <p className="mt-4 text-sm">No account? <a className="underline" href="/signup">Sign up</a></p>
    </main>
  )
}
