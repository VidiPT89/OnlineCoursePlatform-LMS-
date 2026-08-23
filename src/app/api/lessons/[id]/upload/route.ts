import { currentUser, isInstructor } from '@/lib/auth'
import { createDirectUpload } from '@/lib/mux'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser()
  if (!user || !isInstructor(user.role)) return NextResponse.json({ error: 'auth' }, { status: 401 })
  const { id } = await params
  const upload = await createDirectUpload()
  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      muxUploadId: upload.uploadId,
      playbackId: upload.playbackId,
    },
  })
  return NextResponse.json({
    lessonId: lesson.id,
    uploadUrl: upload.url,
    playbackId: lesson.playbackId,
    demo: upload.demo,
  })
}
