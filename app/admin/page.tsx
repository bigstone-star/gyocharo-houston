'use client'
import { useState, useEffect } from 'react'
import { createBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const supabase = createBrowser()

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'pending' | 'all' | 'vip'>('pending')
  const [businesses, setBusinesses] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, vip: 0, pending: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', data.user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }
      loadData()
    })
  }, [router])

  async function loadData() {
    setLoading(true)
    const [totalRes, vipRes] = await Promise.all([
      supabase.from('businesses').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('businesses').select('id,vip_tier', { count: 'exact' }).eq('is_vip', true),
    ])
    const prices: Record<string, number> = { basic: 29, pro: 49, premium: 79 }
    const revenue = (vipRes.data || []).reduce((s, b) => s + (prices[b.vip_tier] || 0), 0)
    setStats({ total: totalRes.count || 0, vip: vipRes.count || 0, pending: 0, revenue })

    let q = supabase.from('businesses').select('*').eq('is_active', true)
    if (tab === 'pending') q = q.eq('data_source', 'user_registered')
    if (tab === 'vip') q = q.eq('is_vip', true)
    q = q.order('created_at', { ascending: false }).limit(50)
    const { data } = await q
    setBusinesses(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [tab])

  const approve = async (id: string) => {
    await supabase.from('businesses').update({ approved: true }).eq('id', id)
    loadData()
  }
  const toggleVIP = async (b: any) => {
    await supabase.from('businesses').update({ is_vip: !b.is_vip, vip_tier: !b.is_vip ? 'pro' : null }).eq('id', b.id)
    loadData()
  }
  const deactivate = async (id: string) => {
    if (!confirm('비활성화?')) return
    await supabase.from('businesses').update({ is_active: false }).eq('id', id)
    loadData()
  }

  return (
    <div className="min-h-screen bg-slate-100 max-w-2xl mx-auto pb-10">
      <div className="bg-[#1a1a2e] px-5 pt-10 pb-6">
        <h1 className="text-[22px] font-extrabold text-white">🛠 관리자 대시보드</h1>
      </div>
      <div className="grid grid-cols-4 gap-3 px-4 py-4">
        {[
          { label: '전체', value: stats.total, color: 'text-slate-700' },
          { label: 'VIP', value: stats.vip, color: 'text-amber-600' },
          { label: '월수익', value: `$${stats.revenue}`, color: 'text-green-600' },
          { label: '', value: '', color: '' },
        ].map((s, i) => s.label ? (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <div className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ) : <div key={i} />)}
      </div>
      <div className="px-4 flex gap-2 mb-3">
        {[['pending','등록 대기'],['vip','VIP'],['all','전체']].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-4 py-2 rounded-lg text-[12px] font-bold ${tab===k?'bg-indigo-600 text-white':'bg-white border border-slate-200 text-slate-600'}`}>{l}</button>
        ))}
      </div>
      <div className="px-4 space-y-2">
        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        : businesses.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-slate-800 text-[14px] flex items-center gap-2">
                  {b.name_kr || b.name_en}
                  {b.is_vip && <span className="text-[9px] font-black bg-amber-300 text-amber-900 px-1.5 py-0.5 rounded">{b.vip_tier?.toUpperCase()}</span>}
                </div>
                <div className="text-[11px] text-slate-400">{b.category_main} · {b.phone}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {tab === 'pending' && <button onClick={() => approve(b.id)} className="flex-1 bg-green-500 text-white text-[12px] font-bold py-2 rounded-lg">✅ 승인</button>}
              <button onClick={() => toggleVIP(b)} className={`flex-1 text-[12px] font-bold py-2 rounded-lg ${b.is_vip?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>
                {b.is_vip ? 'VIP 해제' : '⭐ VIP 지정'}
              </button>
              <button onClick={() => deactivate(b.id)} className="px-3 text-[12px] font-bold py-2 rounded-lg bg-slate-100 text-slate-500">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}