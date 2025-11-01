import React from 'react'
import clsx from 'clsx'

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

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  small: 'h-[30px] min-w-[64px] px-3 text-[13px]',
  medium: 'h-9 min-w-[80px] px-4 text-sm',
  large: 'h-12 min-w-[120px] px-5 text-base',
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: [
    'bg-ssu-primary text-white',
    'hover:bg-ssu-primary-dark',
    'disabled:bg-ssu-primary/60 disabled:text-white',
  ].join(' '),
  secondary: [
    'bg-ssu-muted/10 text-ssu-text',
    'hover:bg-ssu-muted/20',
    'disabled:bg-ssu-muted/10 disabled:text-ssu-text/60',
  ].join(' '),
  outline: [
    'border border-ssu-muted/40 text-ssu-text',
    'hover:border-ssu-primary hover:text-ssu-primary',
    'disabled:border-ssu-muted/20 disabled:text-ssu-text/60',
  ].join(' '),
  ghost: [
    'bg-transparent text-ssu-text',
    'hover:bg-ssu-muted/10',
    'disabled:text-ssu-text/60',
  ].join(' '),
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  disabled = false,
  onClick,
  children,
  className,
  type = 'button',
  style,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ssu-primary/30',
        'disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && icon}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  )
}
