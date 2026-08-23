import { currentUser } from '@/lib/auth'
import { isLessonComplete, percentWatched } from '@/lib/progress'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { id } = await params
  const body = (await request.json()) as { seconds?: number; duration?: number }
  const seconds = Number(body.seconds ?? 0)
  const duration = Number(body.duration ?? 0)
  const percent = percentWatched(seconds, duration)
  const completed = isLessonComplete(percent)

  const row = await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: id } },
    update: { seconds, duration, percent, completed },
    create: { userId: user.id, lessonId: id, seconds, duration, percent, completed },
  })

  return NextResponse.json(row)
}
