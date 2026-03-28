import { NextRequest, NextResponse } from 'next/server'
import { createBrowser } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { tier, businessId } = await req.json()
    const supabase = createBrowser()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Stripe 미설정 시 — 관리자에게 이메일 알림
    return NextResponse.json({
      url: `/pricing?pending=true&tier=${tier}&biz=${businessId}`,
      message: 'Stripe 결제 준비 중입니다. 담당자가 연락드립니다.'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
