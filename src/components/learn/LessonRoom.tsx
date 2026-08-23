'use client'

import { MuxLessonPlayer } from '@/components/player/MuxLessonPlayer'
import { useLocale } from '@/i18n/LocaleProvider'
import { readJson } from '@/lib/http'
import type { LessonRoomPayload } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'

const empty: LessonRoomPayload | null = null

export function LessonRoom({ slug, lessonId }: { slug: string; lessonId?: string }) {
  const { t, locale } = useLocale()
  const [data, setData] = useState<LessonRoomPayload | null>(empty)
  const [choice, setChoice] = useState<number | null>(null)
  const [quizState, setQuizState] = useState<'idle' | 'passed' | 'failed'>('idle')

  const load = useCallback(async () => {
    if (lessonId) {
      setData(await readJson(await fetch(`/api/lessons/${lessonId}`), null))
      return
    }
    setData(await readJson(await fetch(`/api/courses/${slug}`), null))
  }, [lessonId, slug])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setChoice(null)
    setQuizState('idle')
  }, [data?.lesson.id])

  if (!data?.lesson) return <p className="text-[#f4e6c8]/60">{t.empty}</p>

  const title = locale === 'pt' ? data.course.title : data.course.titleEn
  const lessonTitle = locale === 'pt' ? data.lesson.title : data.lesson.titleEn
  const quiz = data.lesson.quiz
  const options = quiz ? (locale === 'pt' ? quiz.options : quiz.optionsEn) : []
  const currentLessonId = data.lesson.id

  async function tick(seconds: number, duration: number) {
    await fetch(`/api/lessons/${currentLessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ seconds, duration }),
    })
    await load()
  }

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
              <div className="meter mt-3">
                <span style={{ width: `${data.lesson.percent}%` }} />
              </div>
            </div>
          </>
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
                <span className="text-xs opacity-70">{item.percent}%</span>
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
