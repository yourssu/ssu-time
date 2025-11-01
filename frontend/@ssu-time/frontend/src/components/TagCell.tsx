interface TagCellProps {
  title: string
  isSelected: boolean
  onClick: () => void
}

export function TagCell({ title, isSelected, onClick }: TagCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-2xl border px-4 py-[10px] text-sm font-medium transition-all
        ${
          isSelected
            ? 'border-ios-blue bg-ios-blue/85 text-white'
            : 'border-ios-gray4 bg-white text-ios-dark-gray hover:border-ios-blue/40'
        }
      `}
    >
      {title}
    </button>
  )
}
