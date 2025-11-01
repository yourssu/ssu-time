import { useEffect, useState } from 'react';

export function useIsMobile(maxWidth: number = 480): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= maxWidth;
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= maxWidth);
    window.addEventListener('resize', onResize);
    // iOS 주소창 변동 대응을 위해 orientationchange에도 반응
    window.addEventListener('orientationchange', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [maxWidth]);

  return isMobile;
}


