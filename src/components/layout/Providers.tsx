'use client'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { SessionProvider } from '@/i18n/SessionProvider'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SessionProvider>{children}</SessionProvider>
    </LocaleProvider>
  )
}
