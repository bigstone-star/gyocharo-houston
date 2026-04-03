'use client'

type Category = {
  id: string
  name: string
  icon: string
  sort_order: number
}

export default function HomeCategoryGrid({
  cats,
  onSelectCategory,
  selected,
}: {
  cats: Category[]
  onSelectCategory: (name: string) => void
  selected: string
}) {
  return (
    <div className="bg-white border-b border-slate-200 px-3 py-3">
      <div className="grid grid-cols-3 gap-2">
        {cats.map((c) => {
          const isActive = selected === c.name

          return (
            <button
              key={c.name}
              onClick={() => onSelectCategory(c.name)}
              className={`
                flex flex-col items-center justify-center
                rounded-lg border
                h-[70px]
                transition
                ${isActive
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200'}
              `}
            >
              <div className="text-[20px]">{c.icon}</div>

              <div className="text-[12px] font-bold mt-1 leading-tight text-center line-clamp-2">
                {c.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
