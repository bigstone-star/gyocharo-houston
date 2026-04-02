'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TYPE_LABEL: any = {
  general: '일반',
  question: '질문',
  recommend: '추천',
  news: '소식',
}

const TYPE_STYLE: any = {
  general: 'bg-slate-100 text-slate-600',
  question: 'bg-blue-50 text-blue-600',
  recommend: 'bg-amber-50 text-amber-700',
  news: 'bg-emerald-50 text-emerald-700',
}

export default function Page({ params }: { params: { region: string } }) {
  const region = params.region

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState<any>(null)
  const [likedMap, setLikedMap] = useState<any>({})

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: userData } = await sb.auth.getUser()
    setUser(userData.user)

    await loadPosts(userData.user)
  }

  const loadPosts = async (u?: any) => {
    setLoading(true)

    const { data } = await sb
      .from('community_posts')
      .select('*')
      .eq('region', region)
      .eq('is_active', true)
      .order('is_pinned', { ascending: false })
      .order('like_count', { ascending: false })
      .order('created_at', { ascending: false })

    setPosts(data || [])

    // 내가 누른 좋아요 체크
    if (u) {
      const { data: likes } = await sb
        .from('community_likes')
        .select('post_id')
        .eq('user_id', u.id)

      const map: any = {}
      ;(likes || []).forEach((l: any) => {
        map[l.post_id] = true
      })
      setLikedMap(map)
    }

    setLoading(false)
  }

  const toggleLike = async (postId: string) => {
    if (!user) {
      alert('로그인 필요')
      return
    }

    const liked = likedMap[postId]

    if (liked) {
      await sb
        .from('community_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      await sb.rpc('decrement_like', { pid: postId })

    } else {
      await sb
        .from('community_likes')
        .insert({ post_id: postId, user_id: user.id })

      await sb.rpc('increment_like', { pid: postId })
    }

    await loadPosts(user)
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return posts
    return posts.filter((p) => p.post_type === filter)
  }, [posts, filter])

  if (loading) return <div className="p-10 text-center">로딩중...</div>

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">{region.toUpperCase()} 커뮤니티</h1>
        <Link
          href={`/community/${region}/write`}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
        >
          글쓰기
        </Link>
      </div>

      {/* 필터 */}
      <div className="flex gap-2">
        {['all', 'question', 'recommend', 'news', 'general'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100'
            }`}
          >
            {f === 'all' ? '전체' : TYPE_LABEL[f]}
          </button>
        ))}
      </div>

      {/* 리스트 */}
      {filtered.map((p) => (
        <div key={p.id} className="bg-white p-4 rounded-xl border">

          {/* 타입 */}
          <div className="flex items-center gap-2 text-xs mb-1">
            {p.is_pinned && (
              <span className="bg-red-50 text-red-600 px-2 py-1 rounded">
                공지
              </span>
            )}

            <span className={`px-2 py-1 rounded ${TYPE_STYLE[p.post_type]}`}>
              {TYPE_LABEL[p.post_type]}
            </span>
          </div>

          {/* 제목 */}
          <div className="font-bold text-lg">{p.title}</div>

          {/* 닉네임 */}
          <div className="text-xs text-gray-400">
            {p.nickname || `이웃-${p.user_id.slice(0, 6)}`}
          </div>

          {/* 내용 */}
          <div className="text-sm mt-2 line-clamp-3">{p.content}</div>

          {/* 버튼 */}
          <div className="flex items-center gap-4 mt-3 text-sm">

            <button
              onClick={() => toggleLike(p.id)}
              className={`font-bold ${
                likedMap[p.id] ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              ❤️ {p.like_count || 0}
            </button>

            <Link href={`/community/${region}/${p.id}`}>
              댓글 {p.comment_count || 0}
            </Link>

          </div>
        </div>
      ))}
    </div>
  )
}
