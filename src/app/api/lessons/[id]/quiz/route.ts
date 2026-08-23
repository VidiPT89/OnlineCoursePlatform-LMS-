import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { id } = await params
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { quiz: true } })
  if (!lesson?.quiz) return NextResponse.json({ error: 'quiz' }, { status: 404 })
  const body = (await request.json()) as { choice?: number }
  const choice = Number(body.choice)
  const passed = choice === lesson.quiz.answer
  const attempt = await prisma.quizAttempt.create({
    data: { userId: user.id, quizId: lesson.quiz.id, choice, passed },
  })
  return NextResponse.json({ passed: attempt.passed, choice })
}
