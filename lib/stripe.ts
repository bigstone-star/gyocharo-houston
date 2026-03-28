import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function createCheckoutSession({
  businessId, userId, tier, priceId, customerEmail,
}: {
  businessId: string; userId: string; tier: string; priceId: string; customerEmail: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?success=true&tier=${tier}`,
    cancel_url: `${baseUrl}/pricing?cancelled=true`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { businessId, userId, tier },
    },
    metadata: { businessId, userId, tier },
  })
  return session
}