"use client"
import { useEffect, useRef, useState } from 'react'

type Msg = { id: string; role: 'user' | 'assistant'; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const streamRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const id = crypto.randomUUID()
    setMessages(m => [...m, { id, role: 'user', content: text }, { id: id + '-a', role: 'assistant', content: '' }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      if (!res.ok) {
        if (res.status === 402) {
          setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Free trial limit reached. Please sign in to continue.' }])
        } else {
          setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Error contacting model.' }])
        }
        return
      }
      const reader = res.body!.getReader()
      streamRef.current = reader
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(m => m.map(msg => msg.id === id + '-a' ? { ...msg, content: msg.content + chunk } : msg))
      }
    } catch (e) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Network error.' }])
    } finally {
      setLoading(false)
      streamRef.current = null
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        send()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [input, loading])

  return (
    <div className="flex flex-col h-dvh">
      <header className="border-b p-3 text-sm">Puli</header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <h1 className="text-2xl font-semibold mb-2">Welcome to Puli</h1>
            <p>Type a message below to start chatting. You have 15 free messages before sign in is required.</p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block max-w-[75%] whitespace-pre-wrap rounded px-3 py-2 ${m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </main>
      <footer className="border-t p-3">
        <div className="mx-auto max-w-3xl flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Send a message... (Ctrl/Cmd + Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          />
          <button className="bg-black text-white rounded px-4" onClick={send} disabled={loading}>Send</button>
        </div>
      </footer>
    </div>
  )
}
