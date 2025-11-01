import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlideInput } from '../ScriptModal/ScriptModalForm'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { StoredFileMeta } from '../../lib/boardStorage'

export type BoardCardProps = {
  file: StoredFileMeta
  onDelete?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  onError?: (message: string) => void
}

export const BoardCard: React.FC<BoardCardProps> = ({ file, onDelete, onRename, onError }) => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [editingName, setEditingName] = useState(file.name)

  const formatDateFixed = (d: Date) => {
    const yy = String(d.getFullYear() % 100).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const h = d.getHours()
    const ampm = h >= 12 ? '오후' : '오전'
    const hh12 = h % 12 === 0 ? 12 : h % 12
    const hh = String(hh12).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${yy}.${mm}.${dd} ${ampm} ${hh}:${min}`
  }

  const uploadedDate = formatDateFixed(new Date(file.uploadedAt))

  const handleOpen = async () => {
    if (isEditing) return; // 편집 모드에서는 파일 열기 방지

    try {
      const { getFileContent } = await import('../../lib/api');

      const fileId = Number(file.id);

      // 백엔드 API로 파일 가져오기
      const pdfBlob = await getFileContent(fileId);
      const pdfFileName = file.name.replace(/\.pptx$/i, '.pdf');
      const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });

      navigate('/practice', {
        state: {
          pdfFile,
          slides: [] as SlideInput[],
          fileId
        }
      });
    } catch (e) {
      console.error('파일 열기 실패:', e);
      const errorMsg = e instanceof Error ? e.message : '파일을 여는 중 문제가 발생했습니다.';
      onError?.(errorMsg);
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditingName(file.name)
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      onError?.('파일 이름을 입력해주세요.')
      return
    }

    try {
      await onRename?.(file.id, editingName.trim())
      setIsEditing(false)
    } catch (e) {
      console.error('파일 이름 수정 실패:', e)
      const errorMsg = e instanceof Error ? e.message : '파일 이름 수정에 실패했습니다.'
      onError?.(errorMsg)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingName(file.name)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div
      style={{
        borderRadius: '24px',
        background: 'transparent',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        // 우측 보더 제거
        borderRight: 'none',
      }}
    >
      <div onClick={handleOpen} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: isEditing ? 'default' : 'pointer', flex: 1 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '36px',
            background: colors.primary.normal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.0986 4.00488C10.3276 4.02757 10.5429 4.12883 10.707 4.29297L12.4141 6H21L21.1025 6.00488C21.6067 6.05621 22 6.48232 22 7V17C22 18.6569 20.6569 20 19 20H5C3.39489 20 2.08421 18.7394 2.00391 17.1543L2 17V5L2.00488 4.89746C2.05621 4.39333 2.48232 4 3 4H10L10.0986 4.00488Z" fill="white" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  ...typography.title[3],
                  color: colors.label.normal,
                  border: `1px solid ${colors.primary.normal}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  outline: 'none',
                  flex: 1,
                  minWidth: 0,
                  fontFamily: 'Pretendard, sans-serif',
                }}
              />
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: colors.primary.normal,
                  color: colors.static.white,
                  cursor: 'pointer',
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                저장
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${colors.line.normal}`,
                  backgroundColor: colors.static.white,
                  color: colors.label.normal,
                  cursor: 'pointer',
                  fontFamily: 'Pretendard, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                취소
              </button>
            </div>
          ) : (
            <div style={{ ...typography.body.normal, color: colors.label.normal }}>{file.name}</div>
          )}
          <div style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 400, fontSize: '13px', lineHeight: '13px', color: colors.label.neutral }}>{uploadedDate}</div>
        </div>
      </div>
      <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <details>
          <summary
            style={{
              ...typography.button[2],
              listStyle: 'none', cursor: 'pointer', color: colors.label.neutral,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.00978 10.499C5.8382 10.499 6.50978 11.1706 6.50978 11.999V12.0088C6.50978 12.8372 5.8382 13.5088 5.00978 13.5088H5.00001C4.17169 13.5087 3.50001 12.8371 3.50001 12.0088V11.999C3.50001 11.1707 4.17169 10.4992 5.00001 10.499H5.00978ZM12.0098 10.499C12.8382 10.499 13.5098 11.1706 13.5098 11.999V12.0088C13.5098 12.8372 12.8382 13.5088 12.0098 13.5088H12C11.1717 13.5087 10.5 12.8371 10.5 12.0088V11.999C10.5 11.1707 11.1717 10.4992 12 10.499H12.0098ZM19.0098 10.499C19.8382 10.499 20.5098 11.1706 20.5098 11.999V12.0088C20.5098 12.8372 19.8382 13.5088 19.0098 13.5088H19C18.1717 13.5087 17.5 12.8371 17.5 12.0088V11.999C17.5 11.1707 18.1717 10.4992 19 10.499H19.0098Z" fill="#7D7E83" />
            </svg>
          </summary>
          <div
            style={{
              position: 'absolute',
              right: 0,
              marginTop: '6px',
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px 16px',
              width: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '12px',
              boxShadow: '1px 2px 4px rgba(0,0,0,0.15)',
              zIndex: 10,
            }}
          >
            <button
              onClick={handleStartEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: colors.label.normal,
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '14px',
                height: '24px',
              }}
            >
              <span style={{ width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', marginRight: '6px' , paddingLeft: '1px'}}>
                <svg width="24" height="24" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_rename_icon)">
                    <path d="M2.6665 13.8337H5.33317L12.3332 6.8337C12.6868 6.48008 12.8855 6.00046 12.8855 5.50036C12.8855 5.00027 12.6868 4.52065 12.3332 4.16703C11.9795 3.81341 11.4999 3.61475 10.9998 3.61475C10.4997 3.61475 10.0201 3.81341 9.6665 4.16703L2.6665 11.167V13.8337Z" stroke="#171719" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 4.8335L11.6667 7.50016" stroke="#171719" strokeWidth="0.958333" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_rename_icon">
                      <rect width="16" height="16" fill="white" transform="translate(0 0.5)"/>
                    </clipPath>
                  </defs>
                </svg>
              </span>
              이름 변경
            </button>
            <button
              onClick={() => onDelete?.(file.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: '#FF4D27',
                fontFamily: 'Pretendard, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '14px',
                height: '24px',
              }}
            >
              <span style={{ width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.6667 9.16667V14.1667" stroke="#FF4D27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25"/>
                  <path d="M8.33333 9.16667V14.1667" stroke="#FF4D27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25"/>
                  <path d="M5 5.83333V15.8333C5 16.7538 5.74619 17.5 6.66667 17.5H13.3333C14.2538 17.5 15 16.7538 15 15.8333V5.83333" stroke="#FF4D27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25"/>
                  <path d="M3.33333 5.83333H16.6667" stroke="#FF4D27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25"/>
                  <path d="M5.83333 5.83333L7.5 2.5H12.5L14.1667 5.83333" stroke="#FF4D27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25"/>
                </svg>
              </span>
              파일 삭제
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}


