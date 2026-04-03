'use client'

export default function HomeBusinessModal({
  sel,
  onClose,
}: {
  sel: any
  onClose: () => void
}) {
  if (!sel) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end">
      <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="flex justify-between items-center mb-3">
          <div className="font-extrabold text-[16px]">
            {sel.name_kr || sel.name_en}
          </div>
          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            닫기
          </button>
        </div>

        {/* 카테고리 */}
        <div className="text-xs text-gray-400 mb-2">
          {sel.category_main}
        </div>

        {/* 전화 */}
        {sel.phone && (
          <div className="text-sm text-indigo-600 mb-2">
            {sel.phone}
          </div>
        )}

        {/* 설명 */}
        {sel.description && (
          <div className="text-sm text-gray-600 mb-3">
            {sel.description}
          </div>
        )}

        {/* 상태 */}
        {!sel.approved && (
          <div className="text-xs bg-gray-200 px-2 py-1 rounded inline-block mb-2">
            검토중
          </div>
        )}

      </div>
    </div>
  )
}
