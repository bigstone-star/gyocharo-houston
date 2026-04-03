'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SortType = 'rating' | 'review_count'

export default function HomeClient() {
  const [biz, setBiz] = useState<any[]>([])
  const [vipBiz, setVipBiz] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [cat, setCat] = useState('전체')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('dallas')
  const [sort, setSort] = useState<SortType>('rating')

  // ✅ VIP (승인된 것만)
  const loadVipBusinesses = useCallback(async () => {
    let q = sb
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .eq('metro_area', region)
      .eq('is_vip', true)
      .eq('approved', true)

    if (cat !== '전체') {
      q = q.eq('category_main', cat)
    }

    const { data } = await q
      .order('rating', { ascending: false })
      .limit(6)

    setVipBiz(data || [])
  }, [region, cat])

  // ✅ 일반 업소 (승인 여부 관계없이 표시)
  const loadBusinesses = useCallback(async () => {
    setLoading(true)

    let q = sb
      .from('businesses')
      .select('*')
      .eq('is_active', true)
      .eq('metro_area', region)

    if (cat !== '전체') {
      q = q.eq('category_main', cat)
    }

    if (search.trim()) {
      q = q.or(`name_kr.ilike.%${search}%`)
    }

    if (sort === 'rating') {
      q = q.order('rating', { ascending: false })
    } else {
      q = q.order('review_count', { ascending: false })
    }

    const { data } = await q.limit(20)

    setBiz(data || [])
    setLoading(false)
  }, [region, cat, search, sort])

  useEffect(() => {
    loadVipBusinesses()
    loadBusinesses()
  }, [loadVipBusinesses, loadBusinesses])

  return (
    <div className="max-w-lg mx-auto bg-slate-100 min-h-screen pb-20">

      {/* 🔍 검색 */}
      <div className="bg-white p-3 sticky top-0 z-10 border-b">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색"
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* ⭐ VIP */}
      {vipBiz.length > 0 && (
        <div className="p-3">
          <div className="font-bold text-sm mb-2">⭐ 추천 업소</div>
          <div className="space-y-2">
            {vipBiz.map((b) => (
              <div key={b.id} className="bg-yellow-50 p-3 rounded border">
                <div className="font-bold">{b.name_kr}</div>
                <div className="text-xs text-gray-500">{b.category_main}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📋 리스트 */}
      <div className="p-3 space-y-2">
        {loading ? (
          <div className="text-center py-10 text-gray-400">로딩중...</div>
        ) : (
          biz.map((b) => (
            <div
              key={b.id}
              className="bg-white p-3 rounded border"
            >
              <div className="flex items-center gap-2 mb-1">

                {/* 🔴 검토중 표시 */}
                {!b.approved && (
                  <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded font-bold">
                    검토중
                  </span>
                )}

                {b.is_vip && (
                  <span className="text-[10px] bg-yellow-300 px-2 py-0.5 rounded font-bold">
                    VIP
                  </span>
                )}
              </div>

              <div className="font-bold">{b.name_kr || b.name_en}</div>

              <div className="text-xs text-gray-500 mt-1">
                {b.category_main}
              </div>

              {b.phone && (
                <div className="text-xs text-indigo-600 mt-1">
                  {b.phone}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
