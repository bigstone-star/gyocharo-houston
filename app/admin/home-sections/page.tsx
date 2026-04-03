'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminHomeSectionsPage() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    try {
      const { data: authData } = await sb.auth.getUser()

      if (!authData.user) {
        window.location.href = '/auth/login'
        return
      }

      const { data: profile } = await sb
        .from('user_profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (!profile || !['admin', 'super_admin'].includes(profile.role || '')) {
        window.location.href = '/'
        return
      }

      await loadSections()
    } catch (e) {
      setErrorMsg('홈 섹션 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadSections = async () => {
    const { data, error } = await sb
      .from('home_sections')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      setErrorMsg('홈 섹션을 불러오지 못했습니다.')
      setSections([])
      return
    }

    setSections(data || [])
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const next = [...sections]

    if (direction === 'up' && index > 0) {
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    }

    if (direction === 'down' && index < next.length - 1) {
      ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
    }

    setSections(next)
  }

  const toggleEnabled = (index: number) => {
    const next = [...sections]
    next[index].is_enabled = !next[index].is_enabled
    setSections(next)
  }

  const saveChanges = async () => {
    try {
      for (let i = 0; i < sections.length; i++) {
        const item = sections[i]

        const { error } = await sb
          .from('home_sections')
          .update({
            sort_order: i + 1,
            is_enabled: item.is_enabled,
          })
          .eq('id', item.id)

        if (error) {
          alert('저장 실패: ' + error.message)
          return
        }
      }

      alert('✅ 홈 섹션 순서가 저장되었습니다.')
      await loadSections()
    } catch (e) {
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center max-w-md w-full">
          <div className="text-red-600 font-bold mb-3">{errorMsg}</div>
          <Link
            href="/admin"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
          >
            관리자 홈
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 max-w-2xl mx-auto pb-10">
      <div className="bg-[#1a1a2e] px-5 pt-10 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-white">홈 섹션 관리</h1>
          <p className="text-white/40 text-[12px] mt-0.5">
            홈 화면 표시 순서와 표시 여부를 조정합니다
          </p>
        </div>

        <Link
          href="/admin"
          className="text-white/70 text-[12px] border border-white/20 px-3 py-1.5 rounded-lg"
        >
          Admin
        </Link>
      </div>

      <div className="px-4 py-4 space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-[15px] font-bold text-slate-800">
                {section.section_label}
              </div>
              <div className="text-[12px] text-slate-400 mt-1">
                {section.section_key}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => moveItem(index, 'up')}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 font-bold"
              >
                ↑
              </button>

              <button
                onClick={() => moveItem(index, 'down')}
                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 font-bold"
              >
                ↓
              </button>

              <button
                onClick={() => toggleEnabled(index)}
                className={`px-3 py-2 rounded-lg text-[12px] font-bold ${
                  section.is_enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {section.is_enabled ? '표시중' : '숨김'}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={saveChanges}
          className="w-full bg-indigo-600 text-white rounded-xl py-3 text-[14px] font-bold"
        >
          저장하기
        </button>
      </div>
    </div>
  )
}
