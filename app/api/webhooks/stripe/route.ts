import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const session = event.data.object as any
  const meta = session.metadata || {}
  const { businessId, userId, tier, billing } = meta

  try {
    // 1. 체크아웃 완료 (무료체험 시작)
    if (event.type === 'checkout.session.completed') {
      const periodEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

      await sb.from('subscriptions').upsert({
        business_id: businessId,
        user_id: userId,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        tier: tier,
        status: 'trialing',
        current_period_end: periodEnd,
        amount: tier === 'basic' ? 2900 : tier === 'pro' ? 4900 : 7900,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'business_id' })

      // 업소 VIP 상태 ON
      await sb.from('businesses').update({
        is_vip: true,
        vip_tier: tier,
      }).eq('id', businessId)

      console.log('Checkout completed:', businessId, tier)
    }

    // 2. 결제 성공 (무료체험 종료 후 실제 결제)
    if (event.type === 'invoice.payment_succeeded') {
      const subId = session.subscription
      if (!subId) return NextResponse.json({ received: true })

      const sub = await stripe.subscriptions.retrieve(subId)
      const subMeta = sub.metadata || {}

      await sb.from('subscriptions').update({
        status: 'active',
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subId)

      // 업소 VIP 유지 확인
      if (subMeta.businessId) {
        await sb.from('businesses').update({ is_vip: true }).eq('id', subMeta.businessId)
      }

      console.log('Payment succeeded:', subId)
    }

    // 3. 결제 실패
    if (event.type === 'invoice.payment_failed') {
      const subId = session.subscription
      if (!subId) return NextResponse.json({ received: true })

      await sb.from('subscriptions').update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subId)

      console.log('Payment failed:', subId)
    }

    // 4. 구독 취소
    if (event.type === 'customer.subscription.deleted') {
      const subId = session.id
      const subMeta = session.metadata || {}

      await sb.from('subscriptions').update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', subId)

      // 업소 VIP 해제
      if (subMeta.businessId) {
        await sb.from('businesses').update({
          is_vip: false,
          vip_tier: null,
        }).eq('id', subMeta.businessId)
      }

      console.log('Subscription cancelled:', subId)
    }

    // 5. 무료체험 종료 알림 (3일 전)
    if (event.type === 'customer.subscription.trial_will_end') {
      // 향후 이메일 알림 추가 가능
      console.log('Trial ending soon:', session.id)
    }

  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
