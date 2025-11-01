export type CalendarType = 'basic' | 'scholarship' | 'student-council'

interface CalendarTypeOption {
  id: CalendarType
  title: string
  description: string
  icon: string
}

const calendarTypes: CalendarTypeOption[] = [
  {
    id: 'basic',
    title: '기본형',
    description: '숭실대 기본 학사일정',
    icon: '📅',
  },
  {
    id: 'scholarship',
    title: '장학금형',
    description: '장학금 신청 일정 포함',
    icon: '💰',
  },
  {
    id: 'student-council',
    title: '총학생회',
    description: '총학생회 행사 일정 포함',
    icon: '🎓',
  },
]

interface CalendarTypeSelectorProps {
  selectedType: CalendarType
  onSelectType: (type: CalendarType) => void
}

export function CalendarTypeSelector({ selectedType, onSelectType }: CalendarTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="px-4 text-sm font-medium text-ssu-muted">일정 유형 선택</h3>
      <div className="flex flex-col gap-2">
        {calendarTypes.map((type) => {
          const isSelected = selectedType === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectType(type.id)}
              className={`
                group relative flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-left transition-all
                ${
                  isSelected
                    ? 'border-ssu-primary shadow-md'
                    : 'border-ssu-muted/20 hover:border-ssu-primary/40 hover:shadow-sm'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all
                ${isSelected ? 'bg-ssu-primary/10' : 'bg-gray-50 group-hover:bg-ssu-primary/5'}
              `}
              >
                {type.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div
                  className={`
                  text-base font-semibold transition-colors
                  ${isSelected ? 'text-ssu-primary' : 'text-ssu-text group-hover:text-ssu-primary'}
                `}
                >
                  {type.title}
                </div>
                <div className="text-sm text-ssu-muted">{type.description}</div>
              </div>

              {/* Checkmark */}
              {isSelected && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ssu-primary text-white">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
