'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    export default function CallbackPage() {
      const router = useRouter()

        useEffect(() => {
            const run = async () => {
                  // URL에 code가 있으면 (OAuth 로그인: Google, Kakao)
                        const code = new URLSearchParams(window.location.search).get('code')

                              if (code) {
                                      const { error } = await sb.auth.exchangeCodeForSession(code)
                                              if (error) {
                                                        router.replace('/auth/login?error=auth_failed')
                                                                  return
                                                                          }
                                                                                  router.replace('/dashboard')
                                                                                          return
                                                                                                }

                                                                                                      // code가 없으면 이미 세션이 있는지 확인 (이메일 링크 로그인)
                                                                                                            const { data, error } = await sb.auth.getSession()
                                                                                                                  if (error || !data.session) {
                                                                                                                          router.replace('/auth/login?error=auth_failed')
                                                                                                                                } else {
                                                                                                                                        router.replace('/dashboard')
                                                                                                                                              }
                                                                                                                                                  }
                                                                                                                                                  
                                                                                                                                                      run()
                                                                                                                                                        }, [router])
                                                                                                                                                        
                                                                                                                                                          return (
                                                                                                                                                              <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e]">
                                                                                                                                                                    <div className="text-center">
                                                                                                                                                                            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                                                                                                                                                                    <p className="text-white/60 text-[14px]">로그인 처리 중입니다...</p>
                                                                                                                                                                                          </div>
                                                                                                                                                                                              </div>
                                                                                                                                                                                                )
                                                                                                                                                                                                }
