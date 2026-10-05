'use client'

import { MuxLessonPlayer } from '@/components/player/MuxLessonPlayer'
import { useLocale } from '@/i18n/LocaleProvider'
import { readJson } from '@/lib/http'
import type { LessonRoomPayload } from '@/lib/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

async function fetchRoom(slug: string, lessonId?: string): Promise<LessonRoomPayload | null> {
  const res = await fetch(lessonId ? `/api/lessons/${lessonId}` : `/api/courses/${slug}`)
  return readJson<LessonRoomPayload | null>(res, null)
}

export function LessonRoom({ slug, lessonId }: { slug: string; lessonId?: string }) {
  const { t, locale } = useLocale()
  const [data, setData] = useState<LessonRoomPayload | null>(null)
  const [percent, setPercent] = useState(0)
  const [choice, setChoice] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<'idle' | 'passed' | 'failed'>('idle')

  const apply = useCallback((payload: LessonRoomPayload | null) => {
    setData(payload)
    if (payload?.lesson) setPercent(payload.lesson.percent)
  }, [])

  const load = useCallback(async () => {
    apply(await fetchRoom(slug, lessonId))
  }, [apply, lessonId, slug])

  useEffect(() => {
    let ignore = false
    fetchRoom(slug, lessonId)
      .then((payload) => {
        if (!ignore) apply(payload)
      })
      .catch(() => {
        /* offline: show the empty state */
      })
    return () => {
      ignore = true
    }
  }, [apply, lessonId, slug])

  // A new lesson (or a quiz passed elsewhere) resets the quiz while rendering, not in an effect.
  const quizKey = `${data?.lesson.id}:${data?.lesson.quizPassed}`
  const [seenQuizKey, setSeenQuizKey] = useState(quizKey)
  if (seenQuizKey !== quizKey) {
    setSeenQuizKey(quizKey)
    setChoice(null)
    setQuizState(data?.lesson.quizPassed ? 'passed' : 'idle')
  }

  const tick = useCallback(
    (seconds: number, duration: number) => {
      const next = Math.min(100, Math.round((seconds / duration) * 100))
      setPercent(next)
      void fetch(`/api/lessons/${data?.lesson.id}/progress`, {
        method: 'POST',
        body: JSON.stringify({ seconds, duration }),
      })
    },
    [data?.lesson.id],
  )

  const nextLesson = useMemo(() => {
    if (!data) return null
    const index = data.lessons.findIndex((item) => item.id === data.lesson.id)
    return data.lessons[index + 1] ?? null
  }, [data])

  if (!data?.lesson) return <p className="text-[#f4e6c8]/60">{t.empty}</p>

  const title = locale === 'pt' ? data.course.title : data.course.titleEn
  const lessonTitle = locale === 'pt' ? data.lesson.title : data.lesson.titleEn
  const quiz = data.lesson.quiz
  const options = quiz ? (locale === 'pt' ? quiz.options : quiz.optionsEn) : []
  const notes = locale === 'pt' ? data.lesson.notes : data.lesson.notesEn
  const currentLessonId = data.lesson.id

  async function answer() {
    if (choice === null) return
    const result = await readJson<{ passed?: boolean }>(
      await fetch(`/api/lessons/${currentLessonId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ choice }),
      }),
      {},
    )
    setQuizState(result.passed ? 'passed' : 'failed')
    await load()
  }

  async function markDone() {
    await fetch(`/api/lessons/${currentLessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ seconds: 96, duration: 96 }),
    })
    setPercent(100)
    await load()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
      <section>
        {!data.access ? (
          <div className="panel p-8">
            <p className="display text-4xl text-[#ffaa00]">{t.locked}</p>
            <p className="mt-3 text-[#f4e6c8]/70">{t.noAccess}</p>
            <Link href="/campus" className="mt-6 inline-block text-[#ff7a00]">
              {t.catalog}
            </Link>
          </div>
        ) : (
          <>
            <MuxLessonPlayer playbackId={data.lesson.playbackId} onTick={tick} />
            <div className="mt-4">
              <p className="text-xs tracking-[0.2em] text-[#ff7a00]">{title}</p>
              <h1 className="display text-4xl text-[#ffaa00]">{lessonTitle}</h1>
              <p className="mt-1 text-xs text-[#f4e6c8]/45">{t.watchHint}</p>
              <div className="meter mt-3">
                <span style={{ width: `${percent}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={markDone}
                  className="rounded-full border border-[#f4e6c8]/20 px-4 py-2 text-xs"
                >
                  {t.markDone}
                </button>
                {nextLesson && (
                  <Link
                    href={`/learn/${slug}/${nextLesson.id}`}
                    className="rounded-full bg-[#ff7a00] px-4 py-2 text-xs font-bold text-black"
                  >
                    {t.next}
                  </Link>
                )}
              </div>
            </div>
          </>
        )}

        {data.access && notes && (
          <article className="panel mt-6 p-6">
            <p className="text-xs font-bold tracking-[0.18em] text-[#ff7a00]">{t.notes}</p>
            <p className="mt-2 text-[#f4e6c8]/80">{notes}</p>
          </article>
        )}

        {data.access && quiz && (
          <div className="panel mt-6 p-6">
            <p className="text-xs font-bold tracking-[0.18em] text-[#ff7a00]">{t.quiz}</p>
            <p className="mt-2 text-lg">{locale === 'pt' ? quiz.prompt : quiz.promptEn}</p>
            <div className="mt-4 grid gap-2">
              {options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChoice(index)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm ${choice === index ? 'border-[#ff7a00] bg-[#ff7a00]/15' : 'border-[#f4e6c8]/15'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={answer}
              className="mt-4 rounded-full bg-[#ff7a00] px-5 py-2 text-sm font-bold text-black"
            >
              {t.submit}
            </button>
            {quizState === 'passed' && <p className="mt-3 text-[#ffaa00]">{t.passed}</p>}
            {quizState === 'failed' && <p className="mt-3 text-[#ff7a00]">{t.failed}</p>}
          </div>
        )}
      </section>

      <aside className="panel p-5">
        <p className="display text-3xl text-[#ffaa00]">{t.lessons}</p>
        <ol className="mt-4 space-y-2">
          {data.lessons.map((item) => (
            <li key={item.id}>
              <Link
                href={`/learn/${slug}/${item.id}`}
                className={`block rounded-2xl px-3 py-3 ${item.id === data.lesson.id ? 'bg-[#ff7a00] text-black' : 'border border-[#f4e6c8]/10'}`}
              >
                <span className="block text-sm font-bold">{locale === 'pt' ? item.title : item.titleEn}</span>
                <span className="text-xs opacity-70">
                  {item.id === data.lesson.id ? percent : item.percent}%
                  {item.quizPassed ? ` · ${t.passed}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ol>
        {data.certificateReady && (
          <a
            href={`/api/certificates/${data.course.id}?locale=${locale}`}
            className="mt-6 block rounded-full bg-[#ffaa00] px-4 py-3 text-center text-xs font-bold text-black"
          >
            {t.certificate}
          </a>
        )}
      </aside>
    </div>
  )
}
