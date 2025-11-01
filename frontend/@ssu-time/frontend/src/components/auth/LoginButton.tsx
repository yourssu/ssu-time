import React from 'react'
import { useNavigate } from 'react-router-dom'

interface LoginButtonProps {
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  width,
  height,
  className = '',
  style,
  onClick
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate('/login')
    }
  }
  return (
    <button
      className={`login-button ${className}`}
      style={{
        ...(width && { width: `${width}px` }),
          height: '30px',
        ...(height && { height: `${height}px` }),
        backgroundColor: '#3282FF',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'Pretendard, sans-serif',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s ease',
        outline: 'none',
        padding: '7px 15px',
        ...style
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#3282FF'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = '#2563eb'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.backgroundColor = '#3282FF'
      }}
    >
      로그인
    </button>
  )
} 