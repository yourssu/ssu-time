import React from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

interface LoginButtonProps {
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  children?: React.ReactNode
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  width,
  height = 30,
  className,
  style,
  onClick,
  children = '로그인',
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }
    navigate('/login')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        ...(width ? { width: `${width}px` } : {}),
        height: `${height}px`,
        ...style,
      }}
      className={clsx(
        'flex items-center justify-center gap-2 rounded-lg px-4',
        'bg-ssu-primary text-[13px] font-medium text-white transition-colors',
        'hover:bg-ssu-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ssu-primary/30',
        className,
      )}
    >
      {children}
    </button>
  )
}
