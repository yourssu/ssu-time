import { Link } from 'react-router-dom'
import { Typography } from '../components/ui/Typography'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="not-found-page" style={{ textAlign: 'center', padding: '64px 20px' }}>
      <Typography variant="title1" color="black" style={{ fontSize: '72px', marginBottom: '16px' }}>
        404
      </Typography>
      <Typography variant="title2" color="black" style={{ marginBottom: '16px' }}>
        페이지를 찾을 수 없습니다
      </Typography>
      <Typography variant="body" color="alternative" style={{ marginBottom: '32px' }}>
        요청하신 페이지를 찾을 수 없습니다.
      </Typography>
      
      <Link to="/">
        <Button variant="primary" size="medium">
          홈으로 돌아가기
        </Button>
      </Link>
    </div>
  )
} 