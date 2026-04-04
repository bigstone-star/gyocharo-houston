'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminBusinessesPage() {
  const [list, setList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('Fort Worth')
  const [tab, setTab] = useState<'all' | 'vip' | 'pending' | 'trash'>('all')

  // 🔥 데이터 로드
  const load = async () => {
    setLoading(true)

    let q =
      tab === 'trash'
        ? sb.from('businesses').select('*').eq('is_active', false)
        : sb.from('businesses').select('*').eq('is_active', true)

    if (tab === 'vip') q = q.eq('is_vip', true)
    if (tab === 'pending') q = q.eq('approved', false)

    if (region !== 'all') {
      q = q.eq('metro_area', region)
    }

    // 🔥 카테고리 필터
    if (category !== 'all') {
      q = q.or(
        `category_main.ilike.%${category}%,category_sub.ilike.%${category}%`
      )
    }

    const { data, error } = await q
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) {
      console.error(error)
      setList([])
      setLoading(false)
      return
    }

    let result = data || []

    // 🔥 네이버 스타일 검색
    const term = search.trim().toLowerCase()

    if (term) {
      const terms = term.split(' ').filter(Boolean)

      result = result
        .map((b) => {
          const fields = {
            name: [b.name_kr, b.name_en].join(' ').toLowerCase(),
            category: [b.category_main, b.category_sub].join(' ').toLowerCase(),
            location: [b.address, b.city].join(' ').toLowerCase(),
          }

          let score = 0

          terms.forEach((t) => {
            if (fields.name.includes(t)) score += 5
            if (fields.category.includes(t)) score += 3
            if (fields.location.includes(t)) score += 2
          })

          return { ...b, _score: score }
        })
        .filter((b) => b._score > 0)
        .sort((a, b) => b._score - a._score)
    }

    setList(result)
    setSelected(new Set())
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [search, category, region, tab])

  // 🔥 체크박스
  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const selectAll = () => {
    setSelected(new Set(list.map((b) => b.id)))
  }

  const clearSelect = () => {
    setSelected(new Set())
  }

  const bulkUpdate = async (payload: any) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return

    await sb.from('businesses').update(payload).in('id', ids)
    load()
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-[22px] font-bold mb-4">업소 관리</h1>

      {/* 필터 */}
      <div className="bg-white border rounded-xl p-4 mb-4 flex flex-wrap gap-2">
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="border px-3 py-2 rounded">
          <option value="Fort Worth">Fort Worth</option>
          <option value="Dallas">Dallas</option>
          <option value="Houston">Houston</option>
          <option value="all">전체</option>
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="검색 (이름 / 카테고리 / 주소)"
          className="border px-3 py-2 rounded flex-1"
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border px-3 py-2 rounded">
          <option value="all">전체 카테고리</option>
          <option value="교회">교회</option>
          <option value="식당">식당</option>
          <option value="병원">병원</option>
          <option value="치과">치과</option>
        </select>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {['all', 'vip', 'pending', 'trash'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-3 py-1 rounded ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 액션 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={selectAll} className="px-3 py-1 bg-gray-200 rounded">전체선택</button>
        <button onClick={clearSelect} className="px-3 py-1 bg-gray-200 rounded">해제</button>

        <button onClick={() => bulkUpdate({ approved: true })} className="px-3 py-1 bg-green-500 text-white rounded">
          승인
        </button>

        <button onClick={() => bulkUpdate({ is_vip: true })} className="px-3 py-1 bg-yellow-500 text-white rounded">
          VIP
        </button>

        <button onClick={() => bulkUpdate({ is_vip: false })} className="px-3 py-1 bg-gray-400 text-white rounded">
          VIP 해제
        </button>

        <button onClick={() => bulkUpdate({ is_active: false })} className="px-3 py-1 bg-red-500 text-white rounded">
          삭제
        </button>
      </div>

      {/* 리스트 */}
      <div className="bg-white border rounded-xl divide-y">
        {loading ? (
          <div className="p-6 text-center">로딩중...</div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center text-gray-400">검색 결과 없음</div>
        ) : (
          list.map((b) => (
            <div key={b.id} className="p-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.has(b.id)}
                onChange={() => toggleSelect(b.id)}
              />

              <div className="flex-1">
                <div className="font-bold">{b.name_kr || b.name_en}</div>
                <div className="text-sm text-gray-500">
                  {b.category_main} / {b.category_sub}
                </div>
                <div className="text-xs text-gray-400">{b.address}</div>
              </div>

              {b.is_vip && <span className="text-yellow-500 font-bold">VIP</span>}
              {!b.approved && <span className="text-red-500 text-xs">승인대기</span>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
