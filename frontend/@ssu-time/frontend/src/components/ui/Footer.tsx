export function Footer() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '37px',
        padding: '20px 0',
        boxSizing: 'border-box',
      }}
      data-name="footer"
    >
      <p
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 700,
          fontSize: '13px',
          lineHeight: 'normal',
          color: '#7d7e83',
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        SSU Time
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '39px',
          fontFamily: 'Pretendard, sans-serif',
          fontWeight: 500,
          fontSize: '13px',
          lineHeight: 'normal',
          color: '#7d7e83',
        }}
      >
        <a
          href="https://ssu-time.notion.site/terms"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#7d7e83',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          이용약관
        </a>
        <a
          href="https://ssu-time.notion.site/privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#7d7e83',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          개인정보처리방침
        </a>
      </div>
    </div>
  );
}
