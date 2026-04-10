'use client'

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
  const now = new Date()
  const year = now.getFullYear()

  // 日付ごとの冊数
  const dateMap = new Map<string, number>()
  finishedDates.forEach(d => {
    if (d.startsWith(String(year))) {
      dateMap.set(d, (dateMap.get(d) ?? 0) + 1)
    }
  })

  // 年初から今日までの週のグリッドを生成
  const startOfYear = new Date(year, 0, 1)
  const startDay = startOfYear.getDay()
  const daysInYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const cells: { date: string; count: number }[] = []
  for (let i = 0; i < daysInYear; i++) {
    const d = new Date(year, 0, i + 1)
    const key = d.toISOString().slice(0, 10)
    cells.push({ date: key, count: dateMap.get(key) ?? 0 })
  }

  // 週ごとに分割（先頭を埋める）
  const paddedCells = [...Array(startDay).fill(null), ...cells]
  const weeks: (typeof cells[0] | null)[][] = []
  for (let i = 0; i < paddedCells.length; i += 7) {
    weeks.push(paddedCells.slice(i, i + 7))
  }

  const getColor = (count: number) => {
    if (count === 0) return 'var(--color-border)'
    if (count === 1) return '#9DC97A'
    return 'var(--color-primary)'
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) => (
              <div
                key={di}
                className="w-3 h-3 rounded-sm"
                style={{ background: cell ? getColor(cell.count) : 'transparent' }}
                title={cell ? `${cell.date}: ${cell.count}冊` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--color-subtext)' }}>
        <span>少</span>
        <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-border)' }} />
        <div className="w-3 h-3 rounded-sm" style={{ background: '#9DC97A' }} />
        <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--color-primary)' }} />
        <span>多</span>
      </div>
    </div>
  )
}
