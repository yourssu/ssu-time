import React from 'react'
import { colors } from '../../theme/colors'

interface ProgressProps {
  value: number
  className?: string
  heightPx?: number
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '', heightPx }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  return (
    <div 
      className={`relative w-full overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: colors.line.neutralOpacity, height: heightPx ?? 4 }}
    >
      <div
        className="rounded-full"
        style={{
          display: 'block',
          height: '100%',
          backgroundColor: colors.primary.normal,
          background: colors.primary.normal,
          width: `${clampedValue}%`,
          transition: 'width 250ms ease-out',
        }}
      />
    </div>
  )
} 