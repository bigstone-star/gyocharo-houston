// Stripe는 설정 후 활성화 예정
// npm install stripe 후 아래 주석 해제
export const stripe = null as any;

export async function createCheckoutSession(opts: any) {
  console.log('Stripe not configured yet', opts);
  return { url: '/pricing' };
}
