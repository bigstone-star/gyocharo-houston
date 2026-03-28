'use client'
import { useState } from 'react'
import { createBrowser } from '@/lib/supabase'

const supabase = createBrowser()

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const signInWithGoogle = async () => {
    setLoading('google')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (error) { alert('Google 로그인 실패: ' + error.message); setLoading(null) }
  }

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading('email')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })
    if (error) alert('이메일 전송 실패: ' + error.message)
    else setEmailSent(true)
    setLoading(null)
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold text-white"><span className="text-amber-400">교차로</span> 휴스턴</h1>
          <p className="text-white/50 text-[14px] mt-1">Houston 한인 비즈니스 디렉토리</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-[20px] font-extrabold text-slate-800 mb-1">로그인 / 회원가입</h2>
          <p className="text-[13px] text-slate-400 mb-6">처음이라면 자동으로 계정이 생성됩니다</p>
          {emailSent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📧</div>
              <div className="text-[16px] font-bold text-slate-800 mb-2">이메일을 확인해주세요</div>
              <div className="text-[13px] text-slate-500">{email}로 로그인 링크를 보냈습니다</div>
            </div>
          ) : (
            <>
              <button onClick={signInWithGoogle} disabled={!!loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3.5 mb-3 font-bold text-[15px] text-slate-700 hover:bg-slate-50 active:scale-[.98] transition-all disabled:opacity-60">
                {loading === 'google'
                  ? <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  : <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                    </svg>
                }
                Google로 계속하기
              </button>
              <button onClick={() => alert('카카오 로그인 준비 중입니다. 이메일 로그인을 이용해 주세요.')}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] rounded-xl py-3.5 mb-5 font-bold text-[15px] text-[#3C1E1E] hover:bg-yellow-300 active:scale-[.98] transition-all">
                💬 카카오로 계속하기
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[12px] text-slate-400">또는 이메일로</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <form onSubmit={signInWithEmail}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="이메일 주소 입력" required
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-indigo-400 mb-3" />
                <button type="submit" disabled={!!loading}
                  className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold text-[15px] hover:bg-indigo-700 active:scale-[.98] transition-all disabled:opacity-60">
                  {loading === 'email' ? '전송 중...' : '이메일 로그인 링크 받기'}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-white/30 text-[12px] mt-6">로그인 시 이용약관 및 개인정보처리방침에 동의합니다</p>
      </div>
    </div>
  )
}