import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { colors } from '../theme/colors';
import { TopNavBar } from '../components/ui/TopNavBar';
import { SimplePdfViewer } from '../components/ui/SimplePdfViewer';
import { getPublicCurrentPage, getPublicFileContent } from '../lib/api';

export default function PublicPage() {
  const [searchParams] = useSearchParams();
  const storedName = searchParams.get('file');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const pollingRef = useRef<number | null>(null);

  // 파일 로드
  useEffect(() => {
    let revokeUrl: string | null = null;
    const load = async () => {
      if (!storedName) {
        setError('파일 식별자가 없습니다. 쿼리 파라미터 file=...을 확인하세요.');
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const blob = await getPublicFileContent(storedName);
        const url = URL.createObjectURL(blob);
        revokeUrl = url;
        setBlobUrl(url);
        // File 객체로 변환하여 기존 SimplePdfViewer 재사용
        const file = new File([blob], `${storedName}.pdf`, { type: 'application/pdf' });
        fileRef.current = file;
        // 페이지 수 계산
        try {
          const { getPdfPageCount } = await import('../lib/pdfUtils');
          const count = await getPdfPageCount(file);
          setTotalPages(count);
        } catch {
          // 실패 시 미정 (0)
          setTotalPages(0);
        }
      } catch (e: any) {
        setError(e?.message || '파일을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [storedName]);

  // 현재 페이지 폴링 (1초)
  useEffect(() => {
    if (!storedName) return;
    if (!autoAdvance) return;
    const tick = async () => {
      try {
        const page = await getPublicCurrentPage(storedName);
        if (Number.isFinite(page) && page > 0) setCurrentPage(page);
      } catch (e) {
        // 공개 페이지 폴링 실패는 조용히 무시
      }
    };
    // 즉시 1회
    tick();
    const id = window.setInterval(tick, 1000);
    pollingRef.current = id;
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    };
  }, [storedName, autoAdvance]);

  const handlePageChange = (page: number) => {
    // 사용자가 직접 이동 시, 자동 이동은 유지 (요구사항: 기본은 자동 이동 허용, 사용자가 끌 수 있음)
    setCurrentPage(page);
  };

  const fileForViewer = useMemo(() => {
    return fileRef.current;
  }, [blobUrl]);

  return (
    <div style={containerStyle}>
      <TopNavBar />
      <div style={contentStyle}>
        <div style={leftPaneStyle}>
          <div style={viewerBoxStyle}>
            <SimplePdfViewer file={fileForViewer} currentPage={currentPage} />
          </div>
        </div>
        <div style={rightPaneStyle}>
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={panelTitleStyle}>현재 페이지</div>
              <div style={panelSubStyle}>{currentPage}{totalPages > 0 ? ` / ${totalPages}` : ''}</div>
            </div>
            <div style={panelBodyStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={switchLabelStyle}>
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                  />
                  자동 이동
                </label>
                <button
                  style={navButtonStyle}
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  이전
                </button>
                <button
                  style={navButtonStyle}
                  onClick={() => handlePageChange(totalPages > 0 ? Math.min(totalPages, currentPage + 1) : currentPage + 1)}
                >
                  다음
                </button>
              </div>
              {isLoading && <div style={assistiveTextStyle}>파일을 불러오는 중...</div>}
              {error && <div style={errorTextStyle}>{error}</div>}
            </div>
          </div>

          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <div style={panelTitleStyle}>페이지 미리보기</div>
              <div style={panelSubStyle}>클릭하여 이동</div>
            </div>
            <div style={previewGridStyle}>
              {Array.from({ length: totalPages || 0 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handlePageChange(n)}
                  style={{
                    ...previewItemStyle,
                    ...(n === currentPage ? previewItemActiveStyle : {}),
                  }}
                >
                  {n}
                </button>
              ))}
              {totalPages === 0 && (
                <div style={assistiveTextStyle}>페이지 수를 확인할 수 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  backgroundColor: colors.background.normal,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Pretendard, sans-serif',
};

const contentStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 360px',
  gap: '16px',
  padding: '24px 40px',
  boxSizing: 'border-box',
  width: '100%',
  height: 'calc(100vh - 60px)',
};

const leftPaneStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
};

const viewerBoxStyle: React.CSSProperties = {
  backgroundColor: colors.fill.normal,
  borderRadius: '12px',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
};

const rightPaneStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const panelStyle: React.CSSProperties = {
  backgroundColor: colors.background.normal,
  border: `1px solid ${colors.line.normal}`,
  borderRadius: '12px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: colors.label.normal,
};

const panelSubStyle: React.CSSProperties = {
  fontSize: '12px',
  color: colors.label.alternative,
};

const panelBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const switchLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  color: colors.label.normal,
};

const navButtonStyle: React.CSSProperties = {
  height: '30px',
  padding: '0 12px',
  borderRadius: '8px',
  border: `1px solid ${colors.line.normal}`,
  background: colors.background.normal,
  color: colors.label.normal,
  cursor: 'pointer',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#D64545',
};

const assistiveTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: colors.label.alternative,
};

const previewGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px',
};

const previewItemStyle: React.CSSProperties = {
  height: '44px',
  borderRadius: '8px',
  border: `1px solid ${colors.line.normal}`,
  background: colors.background.normal,
  color: colors.label.normal,
  cursor: 'pointer',
};

const previewItemActiveStyle: React.CSSProperties = {
  background: colors.primary.normal,
  color: colors.static.white,
  border: `1px solid ${colors.primary.normal}`,
};


