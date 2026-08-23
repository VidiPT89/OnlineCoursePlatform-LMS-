'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { readJson } from '@/lib/http'
import { motion } from 'framer-motion'
import Link from 'next/link'

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale === 'pt' ? 'pt-PT' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export function Campus() {
  const { t, locale } = useLocale()
  const { data, refresh } = useSession()

  async function signIn(userId: string) {
    await fetch('/api/session', { method: 'POST', body: JSON.stringify({ userId }) })
    await refresh()
  }

  async function signOut() {
    await fetch('/api/session', { method: 'DELETE' })
    await refresh()
  }

  async function checkout(kind: 'course' | 'subscription', courseId?: string) {
    const result = await readJson<{ url?: string; local?: boolean }>(
      await fetch('/api/checkout', { method: 'POST', body: JSON.stringify({ kind, courseId }) }),
      {},
    )
    if (result.url) window.location.href = result.url
    else await refresh()
  }

  return (
    <div className="grid gap-8">
      <section className="panel flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h1 className="display text-4xl text-[#ffaa00]">{t.catalog}</h1>
          <p className="mt-2 text-sm text-[#f4e6c8]/70">{data.user ? data.user.name : t.demoHint}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.demoUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => signIn(user.id)}
              className={`rounded-full border px-3 py-1 text-xs ${data.user?.id === user.id ? 'bg-[#ff7a00] text-black' : 'border-[#f4e6c8]/20'}`}
            >
              {user.name}
            </button>
          ))}
          {data.user && (
            <button type="button" onClick={signOut} className="text-xs text-[#ff7a00]">
              {t.signOut}
            </button>
          )}
        </div>
      </section>

      <section className="panel flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="display text-3xl text-[#ffaa00]">{t.subscription}</p>
          <p className="text-sm text-[#f4e6c8]/70">{t.passLead}</p>
        </div>
        {data.subscribed ? (
          <span className="rounded-full bg-[#ffaa00] px-4 py-2 text-xs font-bold text-black">{t.subscribed}</span>
        ) : (
          <button
            type="button"
            onClick={() => checkout('subscription')}
            className="rounded-full bg-[#ff7a00] px-5 py-2 text-sm font-bold text-black"
          >
            {t.subscribe}
          </button>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {data.courses.map((course, index) => (
          <motion.article
            key={course.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="panel flex flex-col p-5"
          >
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#ff7a00]">
              {course.access === 'free' ? t.free : course.access === 'subscription' ? t.subscription : t.oneTime}
            </p>
            <h2 className="display mt-2 text-3xl text-[#ffaa00]">
              {locale === 'pt' ? course.title : course.titleEn}
            </h2>
            <p className="mt-2 flex-1 text-sm text-[#f4e6c8]/70">
              {locale === 'pt' ? course.synopsis : course.synopsisEn}
            </p>
            <div className="meter mt-4">
              <span style={{ width: `${course.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-[#f4e6c8]/50">
              {course.lessons} {t.lessons}
              {course.priceCents > 0 ? ` · ${money(course.priceCents, locale)}` : ''}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.enrolled ? (
                <Link
                  href={`/learn/${course.slug}`}
                  className="rounded-full bg-[#ff7a00] px-4 py-2 text-xs font-bold text-black"
                >
                  {t.continue}
                </Link>
              ) : course.access === 'one_time' ? (
                <button
                  type="button"
                  onClick={() => checkout('course', course.id)}
                  className="rounded-full border border-[#ff7a00] px-4 py-2 text-xs text-[#ff7a00]"
                >
                  {t.buy}
                </button>
              ) : (
                <span className="text-xs text-[#f4e6c8]/40">{t.locked}</span>
              )}
            </div>
          </motion.article>
        ))}
      </div>
      <p className="text-xs text-[#f4e6c8]/45">{t.muxHint}</p>
      <p className="text-xs text-[#f4e6c8]/45">{t.stripeHint}</p>
    </div>
  )
}
