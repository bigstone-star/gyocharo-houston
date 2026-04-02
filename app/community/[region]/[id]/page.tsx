import Link from 'next/link'

const REGIONS = [
  {
    value: 'houston',
    title: 'Houston',
    subtitle: '휴스턴 지역 한인 커뮤니티',
  },
  {
    value: 'dallas',
    title: 'Dallas',
    subtitle: '달라스 지역 한인 커뮤니티',
  },
  {
    value: 'fort_worth',
    title: 'Fort Worth',
    subtitle: '포트워스 지역 한인 커뮤니티',
  },
  {
    value: 'central_texas',
    title: 'Central Texas',
    subtitle: '텍사스 중부 한인 커뮤니티',
  },
]

export default function CommunityHomePage() {
  return (
    <div className="min-h-screen bg-slate-100 max-w-2xl mx-auto p-4">
      <div className="pt-8 pb-6">
        <h1 className="text-[24px] font-extrabold text-slate-900">
          지역 커뮤니티
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          지역별 커뮤니티를 선택해 글과 소식을 확인해보세요.
        </p>
      </div>

      <div className="grid gap-3">
        {REGIONS.map((region) => (
          <Link
            key={region.value}
            href={`/community/${region.value}`}
            className="block bg-white border border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition"
          >
            <div className="text-[18px] font-bold text-slate-900">
              {region.title}
            </div>
            <div className="text-[13px] text-slate-500 mt-1">
              {region.subtitle}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
