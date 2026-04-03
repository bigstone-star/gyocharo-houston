'use client'

import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function GlobalHeader() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <div className="bg-[#1a1a2e] text-white px-3 py-2 flex items-center justify-between">

      {/* 로고 */}
      <Link href="/" className="font-extrabold text-[16px] whitespace-nowrap">
        <span className="text-amber-400">교차로</span>
      </Link>

      {/* 메뉴 */}
      <div className="flex items-center gap-2">

        <Link
          href="/"
          className="px-3 py-1 rounded bg-white/10 text-[12px] font-bold whitespace-nowrap"
        >
          업소록
        </Link>

        <Link
          href="/community/houston"
          className="px-3 py-1 rounded bg-white/10 text-[12px] font-bold whitespace-nowrap"
        >
          커뮤니티
        </Link>

        {user ? (
          <>
            <Link
              href="/dashboard"
              className="px-3 py-1 rounded bg-amber-400 text-[#1a1a2e] text-[12px] font-bold whitespace-nowrap"
            >
              내정보
            </Link>
          </>
        ) : (
          <Link
            href="/auth/login"
            className="px-3 py-1 rounded bg-white/10 text-[12px] font-bold whitespace-nowrap"
          >
            로그인
          </Link>
        )}
      </div>
    </div>
  )
}
