import { currentUser } from '@/lib/auth'
import { lessonCards } from '@/lib/campus'
import { certificatePdf, serialFor } from '@/lib/certificate'
import { canIssueCertificate } from '@/lib/progress'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { courseId } = await params
  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: 'missing' }, { status: 404 })
  const lessons = await lessonCards(course.id, user.id)
  if (
    !canIssueCertificate({
      lessons: lessons.map((item) => ({
        percent: item.percent,
        hasQuiz: item.hasQuiz,
        quizPassed: item.quizPassed,
      })),
    })
  ) {
    return NextResponse.json({ error: 'incomplete' }, { status: 409 })
  }

  const serial = serialFor(user.id, course.id)
  await prisma.certificate.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: { serial },
    create: { userId: user.id, courseId: course.id, serial },
  })

  const locale = new URL(request.url).searchParams.get('locale') === 'en' ? 'en' : 'pt'
  const pdf = certificatePdf({
    name: user.name,
    course: locale === 'en' ? course.titleEn : course.title,
    serial,
    date: new Date().toISOString().slice(0, 10),
    locale,
  })

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="aula-${course.slug}.pdf"`,
    },
  })
}
