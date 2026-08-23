'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel glow px-8 py-12"
      >
        <p className="text-xs font-bold tracking-[0.3em] text-[#ff7a00]">LMS</p>
        <h1 className="display mt-3 text-6xl leading-none text-[#ffaa00] sm:text-8xl">{t.brand}</h1>
        <p className="mt-6 max-w-xl text-lg text-[#f4e6c8]/80">{t.heroLead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/campus" className="rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-bold text-black">
            {t.enter}
          </Link>
          <a href="https://ividi.dev/" className="rounded-full border border-[#f4e6c8]/20 px-6 py-3 text-sm">
            ividi.dev
          </a>
        </div>
      </motion.section>

      <section className="grid gap-4">
        {data.courses.map((course, index) => (
          <motion.article
            key={course.slug}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 * index }}
            className="panel p-5"
          >
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#ff7a00]">
              {accessLabel(course.access, t)}
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
          </motion.article>
        ))}
      </section>
    </div>
  )
}
