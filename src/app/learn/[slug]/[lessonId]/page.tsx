import { LessonRoom } from '@/components/learn/LessonRoom'

export default async function Page({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params
  return <LessonRoom slug={slug} lessonId={lessonId} />
}
