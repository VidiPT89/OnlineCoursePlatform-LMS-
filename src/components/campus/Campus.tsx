'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { hues } from '@/lib/enroll'
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
  const open = data.courses.filter((item) => item.enrolled).length
  const papers = data.courses.filter((item) => item.certificated).length
  const mean = data.courses.length
    ? Math.round(data.courses.reduce((sum, item) => sum + item.percent, 0) / data.courses.length)
    : 0

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
          <p className="text-xs tracking-[0.24em] text-[#ff7a00]">{t.desk}</p>
          <h1 className="display text-5xl text-[#ffaa00]">{t.catalog}</h1>
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
              {user.name.split(' ')[0]}
            </button>
          ))}
          {data.user && (
            <button type="button" onClick={signOut} className="text-xs text-[#ff7a00]">
              {t.signOut}
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t.openRooms, value: String(open) },
          { label: t.progress, value: `${mean}%` },
          { label: t.papers, value: String(papers) },
        ].map((stat) => (
          <article key={stat.label} className="panel px-5 py-4">
            <p className="text-[11px] tracking-[0.16em] text-[#ff7a00]">{stat.label}</p>
            <p className="display mt-1 text-4xl text-[#ffaa00]">{stat.value}</p>
          </article>
        ))}
      </div>

      <section className="panel glow flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="display text-3xl text-[#ffaa00]">{t.subscription}</p>
          <p className="max-w-xl text-sm text-[#f4e6c8]/70">
            {t.passLead} {t.passPrice}
          </p>
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
            className="panel lift flex flex-col overflow-hidden"
          >
            <div className="h-1.5" style={{ background: hues[course.hue] ?? hues.ember }} />
            <div className="flex flex-1 flex-col p-5">
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
                {course.lessons} {t.lessons} · {course.minutes} {t.minutes}
                {course.priceCents > 0 ? ` · ${money(course.priceCents, locale)}` : ''}
                {course.certificated ? ` · ${t.ready}` : ''}
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
                  <button
                    type="button"
                    onClick={() => checkout('subscription')}
                    className="rounded-full border border-[#f4e6c8]/25 px-4 py-2 text-xs"
                  >
                    {t.subscribe}
                  </button>
                )}
                {course.certificated && (
                  <a
                    href={`/api/certificates/${course.id}?locale=${locale}`}
                    className="rounded-full border border-[#ffaa00] px-4 py-2 text-xs text-[#ffaa00]"
                  >
                    {t.certificate}
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
      <p className="text-xs text-[#f4e6c8]/45">{t.muxHint}</p>
      <p className="text-xs text-[#f4e6c8]/45">{t.stripeHint}</p>
    </div>
  )
}
