import React from 'react'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'small' | 'medium' | 'large'
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  size = 'medium',
}) => {
  if (!isOpen) return null

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { maxWidth: '400px', width: '90%' }
      case 'medium':
        return { maxWidth: '600px', width: '90%' }
      case 'large':
        return { maxWidth: '800px', width: '90%' }
      default:
        return { maxWidth: '600px', width: '90%' }
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className={`dialog-overlay ${className}`}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="dialog-content"
        style={{
          ...getSizeStyles(),
          backgroundColor: colors.background.normal,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {title && (
          <div
            className="dialog-header"
            style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${colors.line.normal}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                ...typography.title[2],
                color: colors.label.normal,
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: colors.label.assistive,
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.2s ease',
              }}
            >
              ×
            </button>
          </div>
        )}
        <div
          className="dialog-body"
          style={{
            padding: '24px',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
} 