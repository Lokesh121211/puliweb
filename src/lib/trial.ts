import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const encoder = new TextEncoder()
const COOKIE_NAME = 'trial'
const MAX_TRIALS = 15

export async function getTrialCount(): Promise<number> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return 0
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return 0
    const { payload } = await jwtVerify(token, encoder.encode(secret))
    const c = typeof payload.c === 'number' ? payload.c : 0
    return Math.max(0, Math.min(MAX_TRIALS, c))
  } catch {
    return 0
  }
}

export async function setTrialCount(count: number) {
  const store = await cookies()
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')
  const token = await new SignJWT({ c: Math.max(0, Math.min(MAX_TRIALS, count)) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(encoder.encode(secret))
  store.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
}

export { MAX_TRIALS }
