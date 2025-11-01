import { Link, useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAtom } from 'jotai'
import { Logo } from './Logo'
import { LoginButton } from '../auth/LoginButton'
import { LogoutButton } from '../auth/LogoutButton'
import { Typography } from './Typography'
import { isLoggedInAtom, userAtom } from '../../atoms/auth'

export const TopNavBar: React.FC = () => {
  const isMobile = useIsMobile(480);
  const [isLoggedIn] = useAtom(isLoggedInAtom);
  const [user] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <nav style={{
      width: '100%',
      height: '60px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: isMobile ? '10px 20px' : '15px 45px',
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 100,
      boxSizing: 'border-box',
      margin: 0,
      borderBottom: '1px solid #EEEEEE'
    }}>
      {/* 왼쪽: 로고 */}
      <Link to="/" style={{ 
        textDecoration: 'none', 
        display: 'flex', 
        alignItems: 'center'
      }}>
        <Logo />
      </Link>
      
      {/* 오른쪽: 텍스트 + 로그인 버튼 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : '17px'
      }}>
        {!isMobile && (
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography variant="label" color="black" style={{ cursor: 'pointer' }}>
              홈으로
            </Typography>
          </Link>
        )}
        {isLoggedIn ? (
          <>
            {user && (
              <Typography variant="label" color="black" style={{ fontSize: isMobile ? '12px' : '14px', whiteSpace: 'nowrap' }}>
                {user.email}님
              </Typography>
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