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
  const features = [t.featUpload, t.featProgress, t.featQuiz, t.featCert, t.featPay]

  return (
    <div className="grid gap-12">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          <p className="text-xs font-bold tracking-[0.22em] text-[#ff7a00]">{t.product}</p>
          <h1 className="display mt-3 text-7xl leading-none text-[#ffaa00] sm:text-8xl">{t.brand}</h1>
          <p className="mt-6 max-w-xl text-lg text-[#f4e6c8]/85">{t.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/campus" className="rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-bold text-black">
              {t.enter}
            </Link>
            <a href="https://ividi.dev/" className="rounded-full border border-[#f4e6c8]/20 px-6 py-3 text-sm">
              ividi.dev
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {features.map((item) => (
              <li
                key={item}
                className="rounded-full border border-[#f4e6c8]/15 px-3 py-1 text-xs text-[#f4e6c8]/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.section>

        <section>
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-[#ff7a00]">{t.samples}</p>
          <div className="grid gap-4">
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
                  <p className="text-[11px] font-bold tracking-[0.14em] text-[#ff7a00]">
                    {accessLabel(course.access, t)} · {course.lessons} {t.lessons}
                  </p>
                  <h2 className="display mt-1 text-3xl text-[#ffaa00]">
                    {locale === 'pt' ? course.title : course.titleEn}
                  </h2>
                  <p className="mt-2 text-sm text-[#f4e6c8]/70">
                    {locale === 'pt' ? course.synopsis : course.synopsisEn}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      <section>
        <p className="display text-4xl tracking-[0.08em] text-[#ffaa00]">{t.how}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[t.stepWatch, t.stepQuiz, t.stepPaper].map((step, index) => (
            <article key={step} className="panel p-6">
              <p className="display text-3xl text-[#ff7a00]">0{index + 1}</p>
              <p className="mt-2 text-sm">{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="display text-4xl tracking-[0.08em] text-[#ffaa00]">{t.payTitle}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="panel p-6">
            <p className="display text-3xl text-[#ffaa00]">{t.oneTime}</p>
            <p className="mt-3 text-sm text-[#f4e6c8]/70">{t.stripeHint}</p>
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
