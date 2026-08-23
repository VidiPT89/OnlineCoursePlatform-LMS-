import { prisma } from './prisma'

export async function enrollFreeCourses(userId: string) {
  const free = await prisma.course.findMany({ where: { access: 'free' } })
  await Promise.all(
    free.map((course) =>
      prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId: course.id } },
        update: {},
        create: { userId, courseId: course.id, kind: 'free' },
      }),
    ),
  )
}

export const hues: Record<string, string> = {
  ember: '#ff7a00',
  amber: '#ffaa00',
  coal: '#f4e6c8',
}
