import { currentUser } from '@/lib/auth'
import { activeSubscription, lessonCards } from '@/lib/campus'
import { canIssueCertificate, hasCourseAccess } from '@/lib/progress'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { course: { include: { enrollments: true } }, quiz: true },
  })
  if (!lesson) return NextResponse.json({ error: 'missing' }, { status: 404 })

  const enrolled = user
    ? lesson.course.enrollments.some((item) => item.userId === user.id)
    : false
  const subscribed = user ? await activeSubscription(user.id) : false
  const access = hasCourseAccess({
    access: lesson.course.access,
    enrolled,
    subscribed,
    instructor: user?.role === 'instructor',
  })
  const lessons = await lessonCards(lesson.courseId, user?.id)
  const card = lessons.find((item) => item.id === id)
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })

  return NextResponse.json({
    access,
    certificateReady: canIssueCertificate({
      lessons: lessons.map((item) => ({
        percent: item.percent,
        hasQuiz: item.hasQuiz,
        quizPassed: item.quizPassed,
      })),
    }),
    course: {
      id: lesson.course.id,
      slug: lesson.course.slug,
      title: lesson.course.title,
      titleEn: lesson.course.titleEn,
    },
    lessons,
    lesson: {
      ...card,
      quiz: lesson.quiz
        ? {
            prompt: lesson.quiz.prompt,
            promptEn: lesson.quiz.promptEn,
            options: JSON.parse(lesson.quiz.options) as string[],
            optionsEn: JSON.parse(lesson.quiz.optionsEn) as string[],
          }
        : null,
    },
  })
}
