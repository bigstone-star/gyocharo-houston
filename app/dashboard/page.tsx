'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data } = await sb.auth.getUser()

      if (!data.user) {
        window.location.href = '/auth/login'
        return
      }

      setUser(data.user)

      const { data: profileData } = await sb
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      setProfile(profileData)

      const { data: biz } = await sb
        .from('businesses')
        .select('*')
        .eq('owner_id', data.user.id)
        .order('created_at', { ascending: false })

      setBusinesses(biz || [])
      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return <div className="p-10 text-center">로딩중...</div>
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">내 업소 관리</h1>

      <div className="bg-white p-4 rounded-xl border">
        <div>{profile?.name}</div>
        <div className="text-sm text-gray-400">{profile?.email}</div>
        <div className="text-xs mt-1">권한: {profile?.role}</div>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          연결된 업소가 없습니다
        </div>
      ) : (
        businesses.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-xl border">
            <div className="font-bold text-lg">
              {b.name_kr || b.name_en}
            </div>

            <div className="text-sm text-gray-500 mt-1">
              {b.category_main} {b.category_sub}
            </div>

            <div className="flex gap-2 mt-2 text-xs">
              {!b.approved && <span className="bg-yellow-100 px-2 py-1 rounded">승인대기</span>}
              {b.is_vip && <span className="bg-amber-200 px-2 py-1 rounded">VIP</span>}
              {b.is_active === false && <span className="bg-red-200 px-2 py-1 rounded">비활성</span>}
            </div>

            <a
              href={`/dashboard/business/${b.id}`}
              className="block mt-3 bg-indigo-600 text-white text-center py-2 rounded"
            >
              수정하기
            </a>
          </div>
        ))
      )}
    </div>
  )
}
