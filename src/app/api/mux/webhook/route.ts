import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = (await request.json()) as {
    type?: string
    data?: { upload_id?: string; playback_ids?: { id: string }[]; id?: string }
  }
  if (body.type === 'video.asset.ready' && body.data?.upload_id && body.data.playback_ids?.[0]) {
    await prisma.lesson.updateMany({
      where: { muxUploadId: body.data.upload_id },
      data: {
        muxAssetId: body.data.id,
        playbackId: body.data.playback_ids[0].id,
      },
    })
  }
  return NextResponse.json({ received: true })
}
