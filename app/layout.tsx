import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://kyocharo-houston.vercel.app'),

  title: {
    default: '교차로 휴스턴 | Houston 한인 비즈니스 디렉토리',
    template: '%s | 교차로 휴스턴',
  },

  description:
    'Houston 한인 업소 705개. 식당, 의료, 법률, 미용, 마트 등. 교차로 휴스턴에서 찾으세요.',

  keywords: [
    '휴스턴',
    '한인',
    '비즈니스',
    '디렉토리',
    'Houston',
    'Korean',
    'Business',
    '교차로',
  ],

  openGraph: {
    title: '교차로 휴스턴 | Houston 한인 비즈니스 디렉토리',
    description:
      'Houston 한인 업소 705개. 식당, 의료, 법률, 미용, 마트 등.',
    url: 'https://kyocharo-houston.vercel.app',
    siteName: '교차로 휴스턴',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // 👉 나중에 이미지 넣으면 자동 적용
        width: 1200,
        height: 630,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: '교차로 휴스턴 | Houston 한인 비즈니스 디렉토리',
    description:
      'Houston 한인 업소 705개. 식당, 의료, 법률, 미용, 마트 등.',
    images: ['/og-image.png'],
  },

  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
