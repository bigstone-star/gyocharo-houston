import { NextRequest, NextResponse } from 'next/server'

// Stripe webhook — Stripe 설정 후 활성화
export async function POST(req: NextRequest) {
  return NextResponse.json({ received: true })
}
