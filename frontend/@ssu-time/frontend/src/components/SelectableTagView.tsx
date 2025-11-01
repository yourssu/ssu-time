import { useState } from 'react'
import { TagCell } from './TagCell'

interface SelectableTagViewProps {
  tags: string[]
  onSelectionChanged?: (selectedTags: string[]) => void
}

export function SelectableTagView({ tags, onSelectionChanged }: SelectableTagViewProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleToggle = (tag: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(tag)) {
      newSelection.delete(tag)
    } else {
      newSelection.add(tag)
    }
    setSelectedItems(newSelection)
    onSelectionChanged?.(Array.from(newSelection))
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagCell
          key={tag}
          title={tag}
          isSelected={selectedItems.has(tag)}
          onClick={() => handleToggle(tag)}
        />
      ))}
    </div>
  )
}