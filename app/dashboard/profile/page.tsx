'use client'
import { useState, useEffect } from 'react'
import { createBrowser, CATEGORIES } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const supabase = createBrowser()
const CATS = CATEGORIES.filter(c => c.name !== '전체')

export default function ProfilePage() {
  const router = useRouter()
  const [business, setBusiness] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: biz } = await supabase.from('businesses').select('*').eq('owner_id', data.user.id).single()
      if (biz) setBusiness(biz)
    })
  }, [router])

  const upd = (k: string, v: string) => setBusiness((b: any) => ({ ...b, [k]: v }))

  const save = async () => {
    setLoading(true)
    const { error } = await supabase.from('businesses').update({
      name_kr: business.name_kr, name_en: business.name_en,
      category_main: business.category_main, category_sub: business.category_sub,
      address: business.address, phone: business.phone, website: business.website,
      description_kr: business.description_kr,
      sns_instagram: business.sns_instagram, sns_kakao: business.sns_kakao,
    }).eq('id', business.id)
    setLoading(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else alert('저장 실패: ' + error.message)
  }

  if (!business) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-slate-100 max-w-lg mx-auto pb-10">
      <header className="bg-[#1a1a2e] px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white/60 text-2xl">←</button>
        <h1 className="text-[18px] font-extrabold text-white">업소 정보 수정</h1>
      </header>
      <div className="px-4 py-5 space-y-4">
        {saved && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-[14px] font-bold text-green-700">✅ 저장됐습니다!</div>}
        <div className="bg-white rounded-xl p-4 space-y-4">
          {[
            { key: 'name_kr', label: '업소명 (한국어)', placeholder: '고려원 한식당' },
            { key: 'name_en', label: '업소명 (영어)', placeholder: 'Korea Garden' },
            { key: 'phone', label: '전화번호', placeholder: '(713) 000-0000' },
            { key: 'address', label: '주소', placeholder: '9501 Long Point Rd, Houston, TX' },
            { key: 'website', label: '웹사이트', placeholder: 'https://' },
            { key: 'sns_instagram', label: '인스타그램 ID', placeholder: 'instagram_id' },
            { key: 'sns_kakao', label: '카카오 오픈채팅', placeholder: '카카오 코드' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-[12px] font-bold text-slate-500 block mb-1.5">{field.label}</label>
              <input value={business[field.key] || ''} onChange={e => upd(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-indigo-400" />
            </div>
          ))}
          <div>
            <label className="text-[12px] font-bold text-slate-500 block mb-1.5">카테고리</label>
            <select value={business.category_main} onChange={e => upd('category_main', e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-indigo-400 bg-white">
              {CATS.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-bold text-slate-500 block mb-1.5">소개글 (Pro/Premium)</label>
            <textarea value={business.description_kr || ''} onChange={e => upd('description_kr', e.target.value)}
              rows={4} placeholder="업소 소개를 입력해주세요"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-indigo-400 resize-none" />
          </div>
        </div>
        <button onClick={save} disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-xl py-4 text-[15px] font-bold disabled:opacity-60">
          {loading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  )
}