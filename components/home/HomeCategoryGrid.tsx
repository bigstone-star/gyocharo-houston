'use client'

type Category = {
  id: string
  name: string
  icon: string
}

export default function HomeCategoryGrid({
  cats,
  selected,
  onSelectCategory,
}: {
  cats: Category[]
  selected: string
  onSelectCategory: (name: string) => void
}) {
  return (
    <div className="bg-white px-3 py-3">

      {/* 카테고리 타이틀 제거 → 공간 절약 */}

      <div className="grid grid-cols-4 gap-2">
        {cats.map((c) => {
          const isActive = selected === c.name

          return (
            <button
              key={c.name}
              onClick={() => onSelectCategory(c.name)}
              className={`
                flex flex-col items-center justify-center
                rounded-xl
                h-[68px]
                text-center
                transition-all
                border

                ${isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                  : 'bg-slate-50 text-slate-700 border-slate-200'}
              `}
            >
              <div className="text-[20px]">
                {c.icon}
              </div>

              <div className="text-[11px] font-bold mt-1 leading-tight line-clamp-2 px-1">
                {c.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
