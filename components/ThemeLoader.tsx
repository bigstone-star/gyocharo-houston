'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ThemeLoader() {
  useEffect(() => {
    const loadTheme = async () => {
      const { data } = await sb.from('settings').select('key, value')

      if (!data) return

      data.forEach((item) => {
        document.documentElement.style.setProperty(
          `--${item.key}`,
          item.value
        )
      })
    }

    loadTheme()
  }, [])

  return null
}
