import Mux from '@mux/mux-node'

export const DEMO_PLAYBACK = 'a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldF4Rds02nXI'

export function muxEnabled() {
  return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET)
}

export function getMux() {
  if (!muxEnabled()) return null
  return new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  })
}

export async function createDirectUpload() {
  const mux = getMux()
  if (!mux) {
    return {
      uploadId: `demo-${Date.now()}`,
      url: null as string | null,
      playbackId: DEMO_PLAYBACK,
      demo: true,
    }
  }

  const upload = await mux.video.uploads.create({
    new_asset_settings: { playback_policies: ['public'] },
    cors_origin: process.env.NEXT_PUBLIC_APP_URL ?? '*',
  })

  return {
    uploadId: upload.id,
    url: upload.url,
    playbackId: DEMO_PLAYBACK,
    demo: false,
  }
}
