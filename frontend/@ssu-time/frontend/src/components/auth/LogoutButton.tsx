import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtom } from 'jotai'
import clsx from 'clsx'
import { isLoggedInAtom, userAtom } from '../../atoms/auth'
import * as scriptStorage from '../../lib/scriptStorage'
import * as boardStorage from '../../lib/boardStorage'

export interface LogoutButtonProps {
  onClick?: () => void
  className?: string
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick, className }) => {
  const navigate = useNavigate()
  const [, setIsLoggedIn] = useAtom(isLoggedInAtom)
  const [, setUser] = useAtom(userAtom)

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    scriptStorage.clearAll()
    boardStorage.clearAll()

    onClick?.()

    navigate('/', { replace: true })
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={clsx(
        'flex h-[30px] items-center justify-center gap-4 rounded-lg px-4',
        'border border-transparent bg-ssu-background text-[13px] font-medium text-ssu-primary transition-colors',
        'hover:bg-ssu-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ssu-primary/30',
        className,
      )}
    >
      로그아웃
    </button>
  )
}
