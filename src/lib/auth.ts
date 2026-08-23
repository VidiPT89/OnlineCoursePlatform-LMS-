import { cookies } from 'next/headers'
import { prisma } from './prisma'

const COOKIE = 'aula-session'

export async function currentUser() {
  const jar = await cookies()
  const id = jar.get(COOKIE)?.value
  if (!id) return null
  return prisma.user.findUnique({ where: { id } })
}

export async function setSession(userId: string) {
  const jar = await cookies()
  jar.set(COOKIE, userId, { httpOnly: true, sameSite: 'lax', path: '/' })
}

export async function clearSession() {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export function isInstructor(role: string) {
  return role === 'instructor'
}
