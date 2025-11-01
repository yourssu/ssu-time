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
        SpeakOn
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
          href="https://dented-wanderer-019.notion.site/SpeakON-1f09f456eea580339af3e9c213002e86"
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
          href="https://dented-wanderer-019.notion.site/SpeakON-2839f456eea58014a511ecf08224e0e3"
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
