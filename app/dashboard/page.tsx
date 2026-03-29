'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [biz, setBiz] = useState<any[]>([])
  const [bizCount, setBizCount] = useState(0)
  const [vipCount, setVipCount] = useState(0)
  const [pendingEdits, setPendingEdits] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: auth } = await sb.auth.getUser()

      if (!auth.user) {
        window.location.href = '/auth/login'
        return
      }

      setUser(auth.user)

      const [bizRes, vipRes, editRes] = await Promise.all([
        sb
          .from('businesses')
          .select('*')
          .eq('owner_id', auth.user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),

        sb
          .from('businesses')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', auth.user.id)
          .eq('is_vip', true)
          .eq('is_active', true),

        sb
          .from('business_edits')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', auth.user.id)
          .eq('status', 'pending'),
      ])

      setBiz(bizRes.data || [])
      setBizCount((bizRes.data || []).length)
      setVipCount(vipRes.count || 0)
      setPendingEdits(editRes.count || 0)

      setLoading(false)
    }

    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 max-w-lg mx-auto pb-10">
      <div className="bg-[#1a1a2e] px-5 pt-10 pb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-extrabold text-white">👤 내 비즈니스</h1>
          <p className="text-white/40 text-[12px] mt-1">
            업소 연결, 수정 요청, VIP 관리
          </p>
        </div>

        <a
          href="/"
          className="text-white/40 text-[13px] border border-white/20 px-3 py-1.5 rounded-lg"
        >
          홈
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        <div className="bg-white rounded-xl border p-3 text-center">
          <div className="text-[20px] font-extrabold text-slate-800">{bizCount}</div>
          <div className="text-[10px] text-slate-400">내 업소</div>
        </div>

        <div className="bg-white rounded-xl border p-3 text-center">
          <div className="text-[20px] font-extrabold text-amber-600">{vipCount}</div>
          <div className="text-[10px] text-slate-400">VIP</div>
        </div>

        <div className="bg-white rounded-xl border p-3 text-center">
          <div className="text-[20px] font-extrabold text-indigo-600">{pendingEdits}</div>
          <div className="text-[10px] text-slate-400">수정 대기</div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {biz.length > 0 ? (
          <>
            {biz.map((b) => (
              <a
                key={b.id}
                href={`/dashboard/business/${b.id}`}
                className="block bg-white rounded-xl border border-slate-200 px-4 py-4 hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🏢</div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-slate-800">
                      {b.name_kr || b.name_en}
                    </div>

                    <div className="text-[12px] text-slate-400 mt-1">
                      {b.category_main || '카테고리 없음'}
                    </div>

                    {b.phone && (
                      <div className="text-[12px] text-slate-400 mt-1">{b.phone}</div>
                    )}

                    {b.is_vip && (
                      <div className="text-[11px] text-amber-600 font-bold mt-1">
                        ⭐ VIP 업소
                      </div>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-6 text-center">
            <div className="text-[14px] font-bold text-slate-700">
              아직 연결된 내 업소가 없습니다
            </div>
            <div className="text-[12px] text-slate-400 mt-1">
              기존 업소를 찾거나 새 업소를 등록하세요
            </div>
          </div>
        )}

        <a
          href="/register"
          className="block bg-indigo-600 text-white rounded-xl px-4 py-4"
        >
          <div className="flex gap-3">
            <div className="text-2xl">➕</div>
            <div>
              <div className="text-[14px] font-bold">새 업소 등록</div>
              <div className="text-[12px] text-white/70 mt-1">
                내 업소를 새로 등록합니다
              </div>
            </div>
          </div>
        </a>

        <a
          href="/dashboard/claim"
          className="block bg-white rounded-xl border border-slate-200 px-4 py-4 hover:bg-slate-50"
        >
          <div className="flex gap-3">
            <div className="text-2xl">🏷️</div>
            <div>
              <div className="text-[14px] font-bold text-slate-800">내 업소 찾기</div>
              <div className="text-[12px] text-slate-400 mt-1">
                이미 등록된 업소를 내 계정으로 연결
              </div>
            </div>
          </div>
        </a>

        <a
          href="/dashboard/edits"
          className="block bg-white rounded-xl border border-slate-200 px-4 py-4 hover:bg-slate-50"
        >
          <div className="flex gap-3">
            <div className="text-2xl">📄</div>
            <div>
              <div className="text-[14px] font-bold text-slate-800">수정 요청 내역</div>
              <div className="text-[12px] text-slate-400 mt-1">
                내가 보낸 수정 요청 상태 확인
              </div>
            </div>
          </div>
        </a>

        <a
          href="/pricing"
          className="block bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl px-4 py-4"
        >
          <div className="flex gap-3 text-white">
            <div className="text-2xl">⭐</div>
            <div>
              <div className="text-[14px] font-extrabold">VIP 업그레이드</div>
              <div className="text-[12px] text-white/80 mt-1">
                상단 노출 + 광고 효과
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
