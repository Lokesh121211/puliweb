import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const encoder = new TextEncoder()

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signSession(payload: object) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Missing JWT_SECRET')
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encoder.encode(secret))
}

export async function verifySession<T = any>(token: string): Promise<T | null> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return null
    const { payload } = await jwtVerify(token, encoder.encode(secret))
    return payload as T
  } catch {
    return null
  }
}
