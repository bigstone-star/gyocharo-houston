import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createBrowser() {
  return createClient(URL, ANON)
}

export function createAdminClient() {
  return createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY || ANON, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// 타입 정의
export type Business = {
  id: string; place_id: string; name_en: string | null; name_kr: string | null;
  address: string | null; city: string; state: string; phone: string | null;
  website: string | null; category_main: string; category_sub: string | null;
  rating: number | null; review_count: number; is_vip: boolean;
  vip_tier: string | null; vip_expires_at: string | null; is_active: boolean;
  owner_id: string | null; description_kr: string | null; photo_url: string | null;
  sns_instagram: string | null; sns_kakao: string | null; approved: boolean;
}
export const PLANS = [
  { tier: 'basic' as const, name: 'Basic', price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC || '',
    color: 'border-slate-200', badge: '',
    features: ['카테고리 상단 노출', 'BASIC 배지', '업소 정보 관리', '전화/지도/웹', '월간 통계'] },
  { tier: 'pro' as const, name: 'Pro', price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO || '',
    color: 'border-indigo-500', badge: '인기',
    features: ['카테고리 최상단', 'PRO 배지', '소개글', '사진 1장', '주간 통계', 'SNS 연동'] },
  { tier: 'premium' as const, name: 'Premium', price: 79,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM || '',
    color: 'border-amber-400', badge: '최고',
    features: ['전체 최상단', 'PREMIUM 배지', '소개글 무제한', '사진 5장', '실시간 통계', '홈 배너'] },
]
