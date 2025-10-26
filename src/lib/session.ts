import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'

export type SessionUser = { uid: string; email: string }

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  const payload = await verifySession<SessionUser>(token)
  return payload
}
