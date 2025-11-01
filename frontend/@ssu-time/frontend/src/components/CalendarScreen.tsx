import { useState } from 'react'
import { SelectableTagView } from './SelectableTagView'
import { ToggleRowView } from './ToggleRowView'
import { Bell } from 'lucide-react'

export function CalendarScreen() {
  const tags = ['기본형', '총학생회', '외부 공모전', '내부 공모전', '교내 행사', '교외 행사']
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleTagSelectionChanged = (tags: string[]) => {
    setSelectedTags(tags)
    console.log('선택된 태그:', tags)
  }

  const handleDailyToggle = (isOn: boolean) => {
    console.log('하루에 한 번:', isOn)
  }

  const handleUpdateToggle = (isOn: boolean) => {
    console.log('업데이트될 때마다 한 번:', isOn)
  }

  const handleAddToCalendar = () => {
    console.log('webcal 캘린더 추가 시도')
    const webcalUrl = 'webcal://seyeona-ha.github.io/ssu-calendar/ssu_2025_09.ics'

    // Try to open webcal URL
    window.location.href = webcalUrl

    // Fallback: show alert if webcal doesn't work
    setTimeout(() => {
      const userChoice = window.confirm(
        '캘린더 열기 실패\n\nSafari에서 직접 열어보시겠어요?',
      )
      if (userChoice) {
        const httpsUrl = webcalUrl.replace('webcal://', 'https://')
        window.open(httpsUrl, '_blank')
      }
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation Bar */}
      <header className="border-b border-gray-200 bg-white px-5 pb-2 pt-4">
        <h1 className="text-[34px] font-bold tracking-tight text-black">Calendar</h1>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-6">
        {/* Calendar Category Section */}
        <section className="mb-16">
          <h2 className="mb-3 text-lg font-semibold text-black">캘린더 카테고리</h2>
          <SelectableTagView tags={tags} onSelectionChanged={handleTagSelectionChanged} />
        </section>

        {/* Alert Settings Section */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">알림 설정</h2>
          <div className="flex flex-col gap-4">
            <ToggleRowView
              title="하루에 한 번"
              icon={<Bell size={22} fill="currentColor" />}
              isOn={false}
              onToggle={handleDailyToggle}
            />
            <ToggleRowView
              title="업데이트될 때마다 한 번"
              icon={<Bell size={22} fill="currentColor" />}
              isOn={false}
              onToggle={handleUpdateToggle}
            />
          </div>
        </section>
      </div>

      {/* Fixed Bottom Button Container */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-5 pb-5 pt-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="h-[52px] w-full rounded-xl bg-ios-blue text-[17px] font-semibold text-white transition-colors hover:bg-ios-blue/90 active:bg-ios-blue/80"
        >
          캘린더에 추가
        </button>
      </div>
    </div>
  )
}