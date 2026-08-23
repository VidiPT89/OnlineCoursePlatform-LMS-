'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { hues } from '@/lib/enroll'
import { motion } from 'framer-motion'
import Link from 'next/link'

const accessLabel = (access: string, t: { free: string; oneTime: string; subscription: string }) => {
  if (access === 'free') return t.free
  if (access === 'subscription') return t.subscription
  return t.oneTime
}

export function Landing() {
  const { t, locale } = useLocale()
  const { data } = useSession()
  const steps = [t.stepWatch, t.stepQuiz, t.stepPaper]

  return (
    <div className="grid gap-12">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          <p className="text-xs font-bold tracking-[0.42em] text-[#ff7a00]">LMS · CASCAIS</p>
          <h1 className="display mt-3 text-7xl leading-none text-[#ffaa00] sm:text-9xl">{t.brand}</h1>
          <p className="mt-6 max-w-xl text-lg text-[#f4e6c8]/80">{t.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/campus" className="rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-bold text-black">
              {t.enter}
            </Link>
            <a href="https://ividi.dev/" className="rounded-full border border-[#f4e6c8]/20 px-6 py-3 text-sm">
              ividi.dev
            </a>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * index }}
                className="panel px-4 py-4 text-sm"
              >
                <span className="display block text-2xl text-[#ff7a00]">0{index + 1}</span>
                {step}
              </motion.p>
            ))}
          </div>
        </motion.section>

        <section className="grid gap-4">
          {data.courses.map((course, index) => (
            <motion.article
              key={course.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              className="panel lift overflow-hidden"
            >
              <div className="h-1.5" style={{ background: hues[course.hue] ?? hues.ember }} />
              <div className="p-5">
                <p className="text-[11px] font-bold tracking-[0.18em] text-[#ff7a00]">
                  {accessLabel(course.access, t)} · {course.minutes} {t.minutes}
                </p>
                <h2 className="display mt-1 text-3xl text-[#ffaa00]">
                  {locale === 'pt' ? course.title : course.titleEn}
                </h2>
                <p className="mt-2 text-sm text-[#f4e6c8]/70">
                  {locale === 'pt' ? course.synopsis : course.synopsisEn}
                </p>
                <div className="meter mt-4">
                  <span style={{ width: `${course.percent}%` }} />
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      </div>

      <section>
        <p className="display text-4xl tracking-[0.12em] text-[#ffaa00]">{t.how}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="panel p-6">
            <p className="display text-3xl text-[#ffaa00]">{t.free}</p>
            <p className="mt-3 text-sm text-[#f4e6c8]/70">{t.demoHint}</p>
          </article>
          <article className="panel glow p-6">
            <p className="display text-3xl text-[#ffaa00]">{t.subscription}</p>
            <p className="mt-3 text-sm text-[#f4e6c8]/70">
              {t.passLead} {t.passPrice}
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
