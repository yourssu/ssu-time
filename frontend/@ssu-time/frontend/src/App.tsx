const featureCards = [
  {
    title: '캘린더 통합',
    description: '학교 일정과 개인 일정을 한 화면에서 확인하고, 겹치는 이벤트를 쉽게 관리하세요.',
  },
  {
    title: '알림 커스터마이징',
    description: '수업 시작, 과제 마감, 팀프로젝트 미팅 등 필요한 순간에만 알림을 받아보세요.',
  },
  {
    title: '협업 공간',
    description: '팀원과 자료를 공유하고 진행 상황을 추적해 하나의 워크플로우를 유지할 수 있습니다.',
  },
]

function App() {
  return (
    <div className="min-h-screen bg-ssu-background text-ssu-text">
      <header className="border-b border-ssu-muted/20 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-lg font-semibold tracking-tight text-ssu-primary">SSU Time</span>
          <nav className="hidden gap-6 text-sm font-medium text-ssu-muted md:flex">
            <a className="transition-colors hover:text-ssu-primary" href="#features">
              기능
            </a>
            <a className="transition-colors hover:text-ssu-primary" href="#getting-started">
              시작하기
            </a>
            <a className="transition-colors hover:text-ssu-primary" href="#contact">
              문의
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-6 py-20">
        <section className="flex flex-col gap-10 text-center">
          <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <span className="mx-auto rounded-full bg-ssu-primary/10 px-4 py-2 text-sm font-medium text-ssu-primary">
              당신의 일정을 넘어서, 팀의 흐름까지
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-ssu-text md:text-5xl">
              SSU Time으로 캠퍼스 생활을 정리하고 협업을 매끄럽게 연결하세요
            </h1>
            <p className="text-lg text-ssu-muted md:text-xl">
              분산된 일정과 알림, 팀 커뮤니케이션을 하나의 워크플로우로 통합해 더 명확한 하루를 설계합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#getting-started"
              className="rounded-lg bg-ssu-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ssu-primary-dark"
            >
              지금 베타 신청하기
            </a>
            <a
              href="#features"
              className="rounded-lg border border-ssu-muted/40 px-6 py-3 text-sm font-semibold text-ssu-text transition-colors hover:border-ssu-primary hover:text-ssu-primary"
            >
              제품 미리보기
            </a>
          </div>
        </section>

        <section id="features" className="flex flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-2xl font-semibold text-ssu-text md:text-3xl">학생을 위한 핵심 기능</h2>
            <p className="text-sm text-ssu-muted md:text-base">
              헤더를 깔끔하게 유지하고, 핵심에 집중하도록 돕는 SSU Time의 주요 기능입니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col gap-3 rounded-2xl border border-ssu-muted/20 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-ssu-text">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ssu-muted">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="getting-started"
          className="flex flex-col gap-6 rounded-3xl border border-ssu-primary/20 bg-gradient-to-br from-ssu-primary/10 via-white to-white p-10 text-center"
        >
          <h2 className="text-2xl font-semibold text-ssu-text md:text-3xl">곧 만나요</h2>
          <p className="text-sm text-ssu-muted md:text-base">
            학생 커뮤니티와 함께 베타 테스트를 준비 중입니다. 소식을 빠르게 받아보고 싶다면 아래 링크를 통해 사전 등록해주세요.
          </p>
          <a
            href="mailto:ssu-time@soongsil.ac.kr"
            className="mx-auto inline-flex items-center gap-2 rounded-lg bg-ssu-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ssu-primary-dark"
          >
            사전 등록 문의하기
          </a>
        </section>
      </main>

      <footer id="contact" className="border-t border-ssu-muted/20 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 text-sm text-ssu-muted md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} SSU Time. All rights reserved.</span>
          <div className="flex gap-4">
            <a className="transition-colors hover:text-ssu-primary" href="mailto:ssu-time@soongsil.ac.kr">
              이메일
            </a>
            <a className="transition-colors hover:text-ssu-primary" href="https://github.com/ssu-time">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
