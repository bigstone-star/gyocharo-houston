import Stripe from 'stripe'

// Stripe 인스턴스 - 서버에서만 사용
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// 플랜별 Stripe Price ID 매핑
export const PRICE_IDS: Record<string, string> = {
  'basic-monthly':   process.env.STRIPE_BASIC_MONTHLY   || '',
  'pro-monthly':     process.env.STRIPE_PRO_MONTHLY     || '',
  'premium-monthly': process.env.STRIPE_PREMIUM_MONTHLY || '',
  'basic-yearly':    process.env.STRIPE_BASIC_YEARLY    || '',
  'pro-yearly':      process.env.STRIPE_PRO_YEARLY      || '',
  'premium-yearly':  process.env.STRIPE_PREMIUM_YEARLY  || '',
}

// 플랜 정보
export const PLAN_INFO: Record<string, { name: string; price: number; yearlyPrice: number }> = {
  basic:   { name: 'Basic',   price: 29, yearlyPrice: 24 },
  pro:     { name: 'Pro',     price: 49, yearlyPrice: 41 },
  premium: { name: 'Premium', price: 79, yearlyPrice: 66 },
}
