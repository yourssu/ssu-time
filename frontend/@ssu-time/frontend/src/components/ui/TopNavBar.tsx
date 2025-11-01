import { Link, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAtom } from 'jotai'
import { Logo } from './Logo'
import { LoginButton } from '../auth/LoginButton'
import { LogoutButton } from '../auth/LogoutButton'
import { isLoggedInAtom, userAtom } from '../../atoms/auth'

export const TopNavBar: React.FC = () => {
  const isMobile = useIsMobile(480)
  const [isLoggedIn] = useAtom(isLoggedInAtom)
  const [user] = useAtom(userAtom)
  const navigate = useNavigate()

  const handleLoginClick = () => {
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 flex h-[60px] w-full items-end justify-between border-b border-[#EEEEEE] bg-white px-5 py-3 md:px-11 md:py-4">
      <Link to="/" className="flex items-center">
        <Logo />
      </Link>

      <div className="flex items-center gap-3 md:gap-4">
        {!isMobile && (
          <Link
            to="/"
            className="text-[13px] font-medium text-ssu-text transition-colors hover:text-ssu-primary"
          >
            홈으로
          </Link>
        )}
        {isLoggedIn ? (
          <>
            {user && (
              <span className="whitespace-nowrap text-[12px] font-medium text-ssu-text md:text-sm">
                {user.email}님
              </span>
            )}
            <LogoutButton />
          </>
        ) : (
          <LoginButton onClick={handleLoginClick} />
        )}
      </div>
    </nav>
  )
}
