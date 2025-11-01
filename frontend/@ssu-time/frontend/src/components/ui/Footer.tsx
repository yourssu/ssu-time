export function Footer() {
  return (
    <div
      data-name="footer"
      className="flex items-center gap-[37px] py-5 text-[13px] font-medium text-ssu-muted"
    >
      <p className="m-0 whitespace-nowrap font-bold">SSU Time</p>
      <div className="flex items-center gap-[39px]">
        <a
          href="https://ssu-time.notion.site/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-ssu-muted no-underline transition-colors hover:text-ssu-primary-dark"
        >
          이용약관
        </a>
        <a
          href="https://ssu-time.notion.site/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-ssu-muted no-underline transition-colors hover:text-ssu-primary-dark"
        >
          개인정보처리방침
        </a>
      </div>
    </div>
  );
}
