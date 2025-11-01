import { useState } from 'react'

interface ToggleRowViewProps {
  title: string
  icon?: React.ReactNode
  isOn?: boolean
  onToggle?: (isOn: boolean) => void
}

export function ToggleRowView({ title, icon, isOn = false, onToggle }: ToggleRowViewProps) {
  const [enabled, setEnabled] = useState(isOn)

  const handleToggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    onToggle?.(newValue)
  }

  return (
    <div className="flex h-[60px] items-center gap-3 rounded-2xl border-[1.5px] border-transparent bg-ios-gray6 px-4">
      {/* Icon */}
      {icon && <div className="flex h-[22px] w-[22px] items-center justify-center text-ios-blue">{icon}</div>}

      {/* Title */}
      <span className="flex-1 text-base font-medium text-ios-dark-gray">{title}</span>

      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ios-blue focus-visible:ring-offset-2
          ${enabled ? 'bg-ios-blue' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">{title}</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  )
}