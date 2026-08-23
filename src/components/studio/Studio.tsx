'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { readJson } from '@/lib/http'
import { useEffect, useState } from 'react'

export function Studio() {
  const { t, locale } = useLocale()
  const { data } = useSession()
  const [note, setNote] = useState('')

  async function upload(lessonId: string) {
    const result = await readJson<{ demo?: boolean; uploadUrl?: string | null }>(
      await fetch(`/api/lessons/${lessonId}/upload`, { method: 'POST' }),
      {},
    )
    setNote(result.demo ? t.demoUpload : result.uploadUrl ?? t.uploaded)
  }

  if (data.user?.role !== 'instructor') {
    return <p className="text-[#f4e6c8]/60">{t.demoHint}</p>
  }

  return (
    <div className="grid gap-6">
      <h1 className="display text-5xl text-[#ffaa00]">{t.studio}</h1>
      {data.courses.map((course) => (
        <article key={course.id} className="panel p-6">
          <h2 className="display text-3xl text-[#ffaa00]">{locale === 'pt' ? course.title : course.titleEn}</h2>
          <StudioLessons slug={course.slug} onUpload={upload} />
        </article>
      ))}
      {note && <p className="text-sm text-[#ff7a00]">{note}</p>}
    </div>
  )
}

function StudioLessons({ slug, onUpload }: { slug: string; onUpload: (id: string) => void }) {
  const { locale, t } = useLocale()
  const [ids, setIds] = useState<{ id: string; title: string; titleEn: string }[]>([])

  useEffect(() => {
    void (async () => {
      const payload = await readJson<{ lessons?: { id: string; title: string; titleEn: string }[] }>(
        await fetch(`/api/courses/${slug}`),
        {},
      )
      setIds(payload.lessons ?? [])
    })()
  }, [slug])

  return (
    <ul className="mt-4 space-y-2">
      {ids.map((lesson) => (
        <li key={lesson.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#f4e6c8]/10 px-4 py-3">
          <span>{locale === 'pt' ? lesson.title : lesson.titleEn}</span>
          <button type="button" onClick={() => onUpload(lesson.id)} className="text-xs text-[#ff7a00]">
            {t.upload}
          </button>
        </li>
      ))}
    </ul>
  )
}
