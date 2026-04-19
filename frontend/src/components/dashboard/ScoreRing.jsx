import React from 'react';

const COLORS = {
  high: '#5cb88a',
  mid: '#c8a96e',
  low: '#e07070'
};

export default function ScoreRing({ value = 0, size = 72, label = '', strokeWidth = 4 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / 100) * circumference;
  const color = value >= 70 ? COLORS.high : value >= 40 ? COLORS.mid : COLORS.low;
  const center = size / 2;
  const fontSize = size < 60 ? 13 : 16;
  const labelSize = size < 60 ? 8 : 10;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        {/* Value text */}
        <text
          x={center} y={center + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={fontSize}
          fontWeight="700"
          fontFamily="'DM Mono', monospace"
        >
          {Math.round(value)}
        </text>
      </svg>
      {label && (
        <span style={{
          fontSize: labelSize,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 600
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
