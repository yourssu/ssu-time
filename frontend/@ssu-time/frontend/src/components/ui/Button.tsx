import React from 'react'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'
import { padding } from '../../theme/spacing'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  icon?: React.ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
  style,
}) => {
  const getButtonStyles = () => {
    const baseStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: '8px',
      border: 'none',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: typography.button[size === 'small' ? 2 : 1].fontFamily,
      fontWeight: typography.button[size === 'small' ? 2 : 1].fontWeight,
      fontSize: typography.button[size === 'small' ? 2 : 1].fontSize,
      lineHeight: typography.button[size === 'small' ? 2 : 1].lineHeight,
      outline: 'none',
      opacity: disabled ? 0.6 : 1,
    }

    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      small: {
        padding: padding.sm,
        height: '30px',
        minWidth: '64px',
      },
      medium: {
        padding: padding.md,
        height: '36px',
        minWidth: '80px',
      },
      large: {
        padding: padding.lg,
        height: '48px',
        minWidth: '120px',
      },
    }

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: disabled ? colors.interaction.disable : colors.primary.normal,
        color: colors.static.white,
      },
      secondary: {
        backgroundColor: colors.fill.normal,
        color: colors.label.normal,
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.label.normal,
        border: `1px solid ${colors.line.normal}`,
      },
              ghost: {
          backgroundColor: 'transparent',
          color: colors.label.normal,
        },
    }

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    
    const button = e.currentTarget
    switch (variant) {
      case 'primary':
        button.style.backgroundColor = colors.primary.strong
        break
      case 'secondary':
        button.style.backgroundColor = colors.fill.strong
        break
      case 'outline':
        button.style.color = colors.static.white
        button.style.backgroundColor = colors.fill.strong
        break
              case 'ghost':
          button.style.backgroundColor = colors.fill.normal
          break
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    
    const button = e.currentTarget
    switch (variant) {
      case 'primary':
        button.style.backgroundColor = colors.primary.normal
        break
      case 'secondary':
        button.style.backgroundColor = colors.fill.normal
        break
      case 'outline':
        button.style.backgroundColor = 'transparent'
        button.style.color = colors.label.normal
        break
      case 'ghost':
        button.style.backgroundColor = 'transparent'
        break
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    
    const button = e.currentTarget
    if (variant === 'primary') {
      button.style.backgroundColor = colors.primary.strong
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return
    
    const button = e.currentTarget
    if (variant === 'primary') {
      button.style.backgroundColor = colors.primary.normal
    }
  }

  return (
    <button
      type={type}
      className={`button ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={getButtonStyles()}
    >
      {loading && (
        <div 
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  )
} 