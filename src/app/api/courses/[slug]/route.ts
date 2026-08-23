import { currentUser } from '@/lib/auth'
import { activeSubscription, lessonCards, mapCourses } from '@/lib/campus'
import { canIssueCertificate, hasCourseAccess } from '@/lib/progress'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await currentUser()
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { lessons: { include: { quiz: true }, orderBy: { position: 'asc' } } },
  })
  if (!course) return NextResponse.json({ error: 'missing' }, { status: 404 })

  const cards = await mapCourses(user)
  const card = cards.find((item) => item.slug === slug)
  if (!card) return NextResponse.json({ error: 'missing' }, { status: 404 })

  const lessons = await lessonCards(course.id, user?.id)
  const enrolled = user
    ? Boolean(await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }))
    : false
  const subscribed = user ? await activeSubscription(user.id) : false
  const access = hasCourseAccess({
    access: course.access,
    enrolled,
    subscribed,
    instructor: user?.role === 'instructor',
  })

  const current = lessons.find((item) => item.percent < 90) ?? lessons[0]
  const raw = course.lessons.find((item) => item.id === current?.id) ?? course.lessons[0]
  return NextResponse.json({
    course: card,
    lessons,
    lesson: current
      ? {
          ...current,
          quiz: raw?.quiz
            ? {
                prompt: raw.quiz.prompt,
                promptEn: raw.quiz.promptEn,
                options: JSON.parse(raw.quiz.options) as string[],
                optionsEn: JSON.parse(raw.quiz.optionsEn) as string[],
              }
            : null,
        }
      : null,
    access,
    certificateReady: canIssueCertificate({
      lessons: lessons.map((item) => ({
        percent: item.percent,
        hasQuiz: item.hasQuiz,
        quizPassed: item.quizPassed,
      })),
    }),
  })
}
