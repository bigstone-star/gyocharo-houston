'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CommunityWritePage({
  params,
}: {
  params: { region: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const region = params.region

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'general' | 'question' | 'recommend' | 'news'>('general')

  const [businessSearch, setBusinessSearch] = useState('')
  const [businessResults, setBusinessResults] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await sb.auth.getUser()

      if (!data.user) {
        alert('로그인이 필요합니다.')
        router.push('/auth/login')
        return
      }

      setUser(data.user)

      const initialType = searchParams.get('type')
      if (
        initialType === 'general' ||
        initialType === 'question' ||
        initialType === 'recommend' ||
        initialType === 'news'
      ) {
        setType(initialType)
      }

      setLoading(false)
    }

    init()
  }, [router, searchParams])

  const searchBusiness = async () => {
    if (!businessSearch.trim()) {
      setBusinessResults([])
      return
    }

    const keyword = businessSearch.trim()

    const { data } = await sb
      .from('businesses')
      .select('id, name_kr, name_en, category_main')
      .or([
        `name_kr.ilike.%${keyword}%`,
        `name_en.ilike.%${keyword}%`,
      ].join(','))
      .limit(10)

    setBusinessResults(data || [])
  }

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요')
      return
    }

    setSaving(true)

    const nickname = `이웃-${user.id.slice(0, 6)}`

    const { error } = await sb.from('community_posts').insert({
      region,
      post_type: type,
      user_id: user.id,
      nickname,
      title,
      content,
      business_id: selectedBusiness?.id || null,
    })

    setSaving(false)

    if (error) {
      alert('저장 실패: ' + error.message)
      return
    }

    alert('등록 완료')
    router.push(`/community/${region}`)
  }

  if (loading) return <div className="p-10 text-center">로딩중...</div>

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4 bg-slate-100 min-h-screen">
      <h1 className="text-xl font-bold">글 작성</h1>

      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
        className="w-full border p-2 rounded bg-white"
      >
        <option value="general">일반</option>
        <option value="question">질문</option>
        <option value="recommend">추천</option>
        <option value="news">소식</option>
      </select>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="w-full border p-2 rounded bg-white"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
        className="w-full border p-2 rounded bg-white"
        rows={6}
      />

      <div className="space-y-2">
        <input
          value={businessSearch}
          onChange={(e) => setBusinessSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchBusiness()}
          placeholder="추천 업소 검색"
          className="w-full border p-2 rounded bg-white"
        />

        <button
          onClick={searchBusiness}
          className="w-full bg-slate-100 text-slate-700 py-2 rounded font-bold text-sm"
        >
          업소 검색
        </button>

        {businessResults.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            {businessResults.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBusiness(b)
                  setBusinessResults([])
                  setBusinessSearch('')
                }}
                className="w-full text-left border-b last:border-b-0 px-3 py-2 hover:bg-slate-50"
              >
                <div className="font-bold text-sm">{b.name_kr || b.name_en}</div>
                <div className="text-xs text-slate-500">{b.category_main}</div>
              </button>
            ))}
          </div>
        )}

        {selectedBusiness && (
          <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="text-xs text-indigo-500 font-bold mb-1">선택된 업소</div>
            <div className="font-bold text-slate-800">
              {selectedBusiness.name_kr || selectedBusiness.name_en}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={saving}
        className="w-full bg-indigo-600 text-white py-3 rounded font-bold"
      >
        {saving ? '저장중...' : '등록하기'}
      </button>
    </div>
  )
}
