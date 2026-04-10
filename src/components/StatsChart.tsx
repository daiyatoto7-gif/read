'use client'

import { useState } from 'react'
import { MonthlyData } from '@/lib/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface MonthlyChartProps {
  data: MonthlyData[]
}

export function MonthlyBarChart({ data }: MonthlyChartProps) {
  const formatted = data.map(d => ({
    ...d,
    label: d.month.slice(5) + '月',
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v}冊`, '読了数']} />
        <Bar dataKey="count" fill="#2D5016" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface GenreChartProps {
  genreData: { name: string; value: number }[]
}

const COLORS = ['#2D5016', '#E8A838', '#5B8A3C', '#F0C060', '#7FAF55', '#B87B1A']

export function GenrePieChart({ genreData }: GenreChartProps) {
  if (genreData.length === 0) {
    return <p className="text-center text-sm py-8" style={{ color: 'var(--color-subtext)' }}>ジャンルデータがありません</p>
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={genreData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {genreData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
        <Tooltip formatter={(v) => [`${v}冊`, '']} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface HeatmapProps {
  finishedDates: string[]
}

export function YearHeatmap({ finishedDates }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const now = new Date()
  const year = now.getFullYear()
  const todayStr = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const dateMap = new Map<string, number>()
  finishedDates.forEach(d => {
    if (d.startsWith(String(year))) {
      dateMap.set(d, (dateMap.get(d) ?? 0) + 1)
    }
  })

  const CELL = 14
  const GAP = 3
  const STEP = CELL + GAP
  const TOP_OFFSET = 28

  // 正午固定でDST・タイムゾーンのズレを回避
  const startOfYear = new Date(year, 0, 1, 12, 0, 0)
  const startDay = startOfYear.getDay()
  const daysUntilToday = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1

  type Cell = { date: string; count: number; dayOfWeek: number; week: number }
  const cells: Cell[] = []
  for (let i = 0; i < daysUntilToday; i++) {
    const d = new Date(year, 0, i + 1, 12, 0, 0)
    const dateStr = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const globalDay = i + startDay
    cells.push({
      date: dateStr,
      count: dateMap.get(dateStr) ?? 0,
      dayOfWeek: globalDay % 7,
      week: Math.floor(globalDay / 7),
    })
  }

  const totalWeeks = cells.length > 0 ? cells[cells.length - 1].week + 1 : 0
  const svgWidth = totalWeeks * STEP + 4
  const svgHeight = TOP_OFFSET + 7 * STEP

  // 月ラベルの位置を計算
  const monthLabels: { label: string; x: number }[] = []
  let lastMonth = -1
  cells.forEach(cell => {
    const m = parseInt(cell.date.slice(5, 7)) - 1
    if (m !== lastMonth) {
      monthLabels.push({ label: `${m + 1}月`, x: cell.week * STEP })
      lastMonth = m
    }
  })

  const getColor = (count: number) => {
    if (count === 0) return 'var(--color-border)'
    if (count === 1) return '#9DC97A'
    if (count === 2) return '#5AB048'
    return 'var(--color-primary)'
  }

  const DAYS_JA = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <svg
          width={svgWidth}
          height={svgHeight}
          style={{ display: 'block', minWidth: svgWidth }}
        >
          {/* 月ラベル */}
          {monthLabels.map((ml, i) => (
            <text
              key={i}
              x={ml.x}
              y={12}
              fontSize={10}
              fill="var(--color-subtext)"
              fontFamily="inherit"
            >
              {ml.label}
            </text>
          ))}

          {/* 曜日ラベル（月・水・金のみ） */}
          {[1, 3, 5].map(dow => (
            <text
              key={dow}
              x={-2}
              y={TOP_OFFSET + dow * STEP + CELL / 2 + 4}
              fontSize={9}
              fill="var(--color-subtext)"
              fontFamily="inherit"
              textAnchor="end"
            >
              {DAYS_JA[dow]}
            </text>
          ))}

          {/* セル */}
          {cells.map((cell, i) => {
            const cx = cell.week * STEP
            const cy = TOP_OFFSET + cell.dayOfWeek * STEP
            const isToday = cell.date === todayStr
            return (
              <g key={i}>
                <rect
                  x={cx}
                  y={cy}
                  width={CELL}
                  height={CELL}
                  rx={3}
                  fill={getColor(cell.count)}
                  stroke={isToday ? 'var(--color-primary)' : 'none'}
                  strokeWidth={isToday ? 1.5 : 0}
                  style={{ cursor: cell.count > 0 ? 'pointer' : 'default' }}
                  onMouseEnter={e => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect()
                    setTooltip({
                      text: cell.count > 0
                        ? `${cell.date}：${cell.count}冊`
                        : cell.date,
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* ツールチップ（fixed配置） */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 100,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* 凡例 */}
      <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--color-subtext)' }}>
        <span>少ない</span>
        {[0, 1, 2, 3].map(level => (
          <div
            key={level}
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: getColor(level),
              border: '1px solid var(--color-border)',
            }}
          />
        ))}
        <span>多い</span>
        <span style={{ marginLeft: 8 }}>今年の読了日をマークしています</span>
      </div>
    </div>
  )
}
