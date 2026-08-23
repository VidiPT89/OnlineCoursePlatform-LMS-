import { clearSession, currentUser, setSession } from '@/lib/auth'
import { mapCourses, muxEnabled, stripeReady, activeSubscription } from '@/lib/campus'
import { enrollFreeCourses } from '@/lib/enroll'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await currentUser()
  const demoUsers = await prisma.user.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({
    mux: muxEnabled(),
    stripe: stripeReady(),
    subscribed: user ? await activeSubscription(user.id) : false,
    user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
    demoUsers: demoUsers.map((item) => ({ id: item.id, email: item.email, name: item.name, role: item.role })),
    courses: await mapCourses(user),
  })
}

export async function POST(request: Request) {
  const body = (await request.json()) as { userId?: string }
  if (!body.userId) return NextResponse.json({ error: 'user' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: body.userId } })
  if (!user) return NextResponse.json({ error: 'missing' }, { status: 404 })
  await setSession(user.id)
  await enrollFreeCourses(user.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
