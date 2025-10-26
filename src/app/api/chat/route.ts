import { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { getTrialCount, setTrialCount, MAX_TRIALS } from '@/lib/trial'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'message required' }), { status: 400 })
  }

  const user = await getSessionUser()
  if (!user) {
    const count = await getTrialCount()
    if (count >= MAX_TRIALS) {
      return new Response(JSON.stringify({ error: 'trial_limit' }), { status: 402 })
    }
    await setTrialCount(count + 1)
  }

  const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.2:3b'

  const upstream = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: message,
      stream: true,
      options: { temperature: 0.6, num_ctx: 4096 }
    })
  })

  if (!upstream.ok || !upstream.body) {
    return new Response(JSON.stringify({ error: 'upstream_error' }), { status: 502 })
  }

  const transformer = new TransformStream()
  const writer = transformer.writable.getWriter()
  const reader = upstream.body.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  ;(async () => {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value)
        const lines = text.split(/\r?\n/).filter(Boolean)
        for (const line of lines) {
          try {
            const j = JSON.parse(line)
            const chunk = (j.response || '') as string
            if (chunk) await writer.write(encoder.encode(chunk))
          } catch {}
        }
      }
    } catch {}
    finally {
      await writer.close()
    }
  })()

  return new Response(transformer.readable, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  })
}
