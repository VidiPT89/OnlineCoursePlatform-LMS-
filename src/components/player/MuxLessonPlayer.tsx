'use client'

import MuxPlayer from '@mux/mux-player-react'
import { useEffect, useRef } from 'react'

type Props = {
  playbackId: string
  onTick: (seconds: number, duration: number) => void
}

export function MuxLessonPlayer({ playbackId, onTick }: Props) {
  const last = useRef(0)

  useEffect(() => {
    last.current = 0
  }, [playbackId])

  return (
    <div className="reel glow">
      <MuxPlayer
        playbackId={playbackId}
        accentColor="#ff7a00"
        style={{ height: '100%', width: '100%' }}
        onTimeUpdate={(event) => {
          const media = event.target as unknown as { currentTime?: number; duration?: number }
          const seconds = media.currentTime ?? 0
          const duration = media.duration && Number.isFinite(media.duration) ? media.duration : 96
          if (seconds - last.current >= 4 || seconds >= duration - 1) {
            last.current = seconds
            onTick(seconds, duration)
          }
        }}
      />
    </div>
  )
}
