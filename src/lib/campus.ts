import { canIssueCertificate, coursePercent, hasCourseAccess } from './progress'
import { prisma } from './prisma'
import { getStripe } from './stripe'
import { muxEnabled } from './mux'
import type { CourseCard, LessonCard, SessionUser } from './types'

export async function activeSubscription(userId: string) {
  const row = await prisma.subscription.findFirst({
    where: { userId, status: 'active' },
    orderBy: { createdAt: 'desc' },
  })
  return Boolean(row)
}

export async function mapCourses(user: SessionUser | null): Promise<CourseCard[]> {
  const courses = await prisma.course.findMany({
    include: { lessons: { include: { quiz: true }, orderBy: { position: 'asc' } }, enrollments: true, certificates: true },
    orderBy: { createdAt: 'asc' },
  })
  const subscribed = user ? await activeSubscription(user.id) : false
  const progress = user ? await prisma.progress.findMany({ where: { userId: user.id } }) : []
  const attempts = user
    ? await prisma.quizAttempt.findMany({ where: { userId: user.id, passed: true }, include: { quiz: true } })
    : []

  return courses.map((course) => {
    const enrolled = user ? course.enrollments.some((item) => item.userId === user.id) : false
    const lessonState = course.lessons.map((lesson) => ({
      percent: progress.find((item) => item.lessonId === lesson.id)?.percent ?? 0,
      hasQuiz: Boolean(lesson.quiz),
      quizPassed: attempts.some((item) => item.quiz.lessonId === lesson.id),
    }))

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      titleEn: course.titleEn,
      synopsis: course.synopsis,
      synopsisEn: course.synopsisEn,
      access: course.access,
      priceCents: course.priceCents,
      hue: course.hue,
      lessons: course.lessons.length,
      minutes: Math.round(course.lessons.reduce((sum, item) => sum + item.durationSec, 0) / 60),
      enrolled: hasCourseAccess({
        access: course.access,
        enrolled,
        subscribed,
        instructor: user?.role === 'instructor',
      }),
      percent: coursePercent(lessonState.map((item) => ({ percent: item.percent }))),
      certificated: user
        ? course.certificates.some((item) => item.userId === user.id) || canIssueCertificate({ lessons: lessonState })
        : false,
    }
  })
}

export async function lessonCards(courseId: string, userId?: string): Promise<LessonCard[]> {
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    include: { quiz: true, progress: userId ? { where: { userId } } : false },
    orderBy: { position: 'asc' },
  })
  const attempts = userId
    ? await prisma.quizAttempt.findMany({
        where: { userId, passed: true, quiz: { lesson: { courseId } } },
        include: { quiz: true },
      })
    : []

  return lessons.map((lesson) => {
    const row = Array.isArray(lesson.progress) ? lesson.progress[0] : undefined
    return {
      id: lesson.id,
      title: lesson.title,
      titleEn: lesson.titleEn,
      position: lesson.position,
      playbackId: lesson.playbackId,
      durationSec: lesson.durationSec,
      percent: row?.percent ?? 0,
      completed: row?.completed ?? false,
      hasQuiz: Boolean(lesson.quiz),
      quizPassed: attempts.some((item) => item.quiz.lessonId === lesson.id),
      notes: lesson.notes,
      notesEn: lesson.notesEn,
    }
  })
}

export function stripeReady() {
  return Boolean(getStripe())
}

export { muxEnabled }
