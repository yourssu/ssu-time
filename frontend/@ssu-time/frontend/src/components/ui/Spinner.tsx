import React from 'react';
import { colors } from '../../theme/colors';

export interface SpinnerProps {
  /** 스피너 크기 (px) */
  size?: number;
  /** 스피너 색상 */
  color?: string;
  /** 선 두께 (px) */
  strokeWidth?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = colors.primary.normal,
  strokeWidth = 3,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        animation: 'spin 1s linear infinite',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r={12 - strokeWidth / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="60 40"
          opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r={12 - strokeWidth / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="60 40"
          strokeDashoffset="0"
        />
      </svg>
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
