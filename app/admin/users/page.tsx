'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type UserRow = {
  id: string
  email?: string | null
  full_name?: string | null
  role?: string | null
  is_active?: boolean | null
  created_at?: string | null
  business_count?: number
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [users, setUsers] = useState<UserRow[]>([])
  const [search, setSearch] = useState('')
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const { data: authData } = await sb.auth.getUser()

        if (!authData.user) {
          window.location.href = '/auth/login'
          return
        }

        const { data: profile, error } = await sb
          .from('user_profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle()

        if (error) {
          setErrorMsg('권한 정보를 불러오지 못했습니다.')
          setLoading(false)
          return
        }

        if (!profile || !['admin', 'super_admin'].includes(profile.role || '')) {
          window.location.href = '/'
          return
        }

        await loadUsers()
      } catch (e) {
        setErrorMsg('회원 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const loadUsers = async (searchTerm?: string) => {
    try {
      setLoading(true)

      let q = sb
        .from('user_profiles')
        .select('id, email, full_name, role, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(200)

      const term = searchTerm !== undefined ? searchTerm : search

      if (term.trim()) {
        q = q.or(
          [
            `email.ilike.%${term}%`,
            `full_name.ilike.%${term}%`,
            `role.ilike.%${term}%`,
          ].join(',')
        )
      }

      const { data, error } = await q

      if (error) {
        setErrorMsg('회원 목록을 불러오지 못했습니다.')
        setUsers([])
        setLoading(false)
        return
      }

      const profileRows = data || []
      const ids = profileRows.map((u) => u.id).filter(Boolean)

      let businessCounts: Record<string, number> = {}

      if (ids.length > 0) {
        const { data: businessesData } = await sb
          .from('businesses')
          .select('owner_id')
          .in('owner_id', ids)

        ;(businessesData || []).forEach((b: any) => {
          if (!b.owner_id) return
          businessCounts[b.owner_id] = (businessCounts[b.owner_id] || 0) + 1
        })
      }

      const merged = profileRows.map((u: any) => ({
        ...u,
        business_count: businessCounts[u.id] || 0,
      }))

      setUsers(merged)
    } catch (e) {
      setErrorMsg('회원 목록 로딩 중 오류가 발생했습니다.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    await loadUsers(search)
  }

  const updateRole = async (userId: string, nextRole: string) => {
    if (!confirm(`이 회원의 권한을 "${nextRole}"로 변경할까요?`)) return

    try {
      setSavingId(userId)

      const { error } = await sb
        .from('user_profiles')
        .update({ role: nextRole })
        .eq('id', userId)

      if (error) {
        alert('권한 변경 실패: ' + error.message)
        return
      }

      alert('✅ 권한이 변경되었습니다.')
      await loadUsers()
    } finally {
      setSavingId('')
    }
  }

  const toggleActive = async (user: UserRow) => {
    const nextValue = !user.is_active
    if (!confirm(`이 회원을 ${nextValue ? '활성화' : '비활성화'}할까요?`)) return

    try {
      setSavingId(user.id)

      const { error } = await sb
        .from('user_profiles')
        .update({ is_active: nextValue })
        .eq('id', user.id)

      if (error) {
        alert('상태 변경 실패: ' + error.message)
        return
      }

      alert(`✅ 회원이 ${nextValue ? '활성화' : '비활성화'}되었습니다.`)
      await loadUsers()
    } finally {
      setSavingId('')
    }
  }

  if (loading && !users.length && !errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center max-w-md w-full">
          <div className="text-red-600 font-bold mb-3">{errorMsg}</div>
          <a
            href="/admin"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
          >
            관리자 홈
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 max-w-4xl mx-auto pb-10">
      <div className="bg-[#1a1a2e] px-5 pt-10 pb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[22px] font-extrabold text-white">회원 관리</h1>
          <p className="text-white/40 text-[12px] mt-0.5">권한, 상태, 업소 연결 현황 관리</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <a
            href="/admin"
            className="text-white/70 text-[12px] border border-white/20 px-3 py-1.5 rounded-lg"
          >
            Admin
          </a>
          <a
            href="/admin/businesses"
            className="text-white/70 text-[12px] border border-white/20 px-3 py-1.5 rounded-lg"
          >
            업소
          </a>
          <a
            href="/"
            className="text-white/70 text-[12px] border border-white/20 px-3 py-1.5 rounded-lg"
          >
            홈
          </a>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e: any) => e.key === 'Enter' && handleSearch()}
              placeholder="이름, 이메일, 권한 검색..."
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-[13px]"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[13px] font-bold"
            >
              🔍 검색
            </button>
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  loadUsers('')
                }}
                className="bg-slate-100 text-slate-500 px-3 py-2 rounded-lg text-[13px] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-400">
            {search ? `"${search}" 검색 결과가 없습니다` : '회원이 없습니다'}
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-slate-800 truncate">
                    {u.full_name || '이름 없음'}
                  </div>

                  <div className="text-[12px] text-slate-500 mt-1 break-all">
                    {u.email || '이메일 없음'}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      권한: {u.role || 'user'}
                    </span>

                    <span
                      className={`text-[11px] px-2 py-1 rounded ${
                        u.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {u.is_active ? '활성' : '비활성'}
                    </span>

                    <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                      연결 업소 {u.business_count || 0}개
                    </span>
                  </div>

                  {u.created_at && (
                    <div className="text-[11px] text-slate-400 mt-2">
                      가입일: {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <select
                    defaultValue={u.role || 'user'}
                    disabled={savingId === u.id}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-[12px] bg-white"
                  >
                    <option value="user">user</option>
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>

                  <button
                    onClick={() => toggleActive(u)}
                    disabled={savingId === u.id}
                    className={`text-[12px] font-bold px-3 py-2 rounded-lg ${
                      u.is_active
                        ? 'bg-red-50 text-red-600'
                        : 'bg-green-50 text-green-700'
                    } disabled:opacity-50`}
                  >
                    {savingId === u.id
                      ? '처리 중...'
                      : u.is_active
                      ? '비활성화'
                      : '활성화'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
