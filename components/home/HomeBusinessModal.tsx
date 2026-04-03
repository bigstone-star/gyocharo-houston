'use client'

import { createPortal } from 'react-dom'

export default function HomeBusinessModal({
  sel,
  onClose,
}: {
  sel: any
  onClose: () => void
}) {
  if (!sel) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={(e: any) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'white',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '20px',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            {sel.name_kr || sel.name_en || '업소 상세'}
          </div>

          <button
            onClick={onClose}
            style={{
              fontSize: '14px',
              color: '#64748b',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>

        <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: '#334155' }}>
          {sel.category_main && <div>카테고리: {sel.category_main}</div>}
          {sel.category_sub && <div>세부: {sel.category_sub}</div>}
          {sel.phone && <div>전화: {sel.phone}</div>}
          {sel.address && <div>주소: {sel.address}</div>}

          {sel.website && (
            <div>
              홈페이지:{' '}
              <a
                href={sel.website}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#4f46e5', textDecoration: 'underline' }}
              >
                바로가기
              </a>
            </div>
          )}

          {!sel.approved && (
            <div
              style={{
                display: 'inline-block',
                width: 'fit-content',
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#e2e8f0',
                color: '#334155',
              }}
            >
              검토중
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
