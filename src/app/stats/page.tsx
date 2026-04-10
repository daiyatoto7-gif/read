'use client'

import { useMemo } from 'react'
import { useBooks } from '@/lib/BooksContext'
import { calculateStats, getMonthlyData } from '@/lib/stats'
import Navigation from '@/components/Navigation'
import { MonthlyBarChart, GenrePieChart, YearHeatmap } from '@/components/StatsChart'

export default function StatsPage() {
  const { books, loading } = useBooks()

  const stats = calculateStats(books)
  const monthly12 = getMonthlyData(books, 12)

  const genreData = useMemo(() => {
    const map = new Map<string, number>()
    books.forEach(b => {
      if (b.genre) map.set(b.genre, (map.get(b.genre) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [books])

  const finishedDates = books.map(b => b.finishedAt)

  if (loading && books.length === 0) {
    return (
      <div className="lg:ml-60 flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--color-subtext)' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="lg:ml-60 pb-20 lg:pb-0">
      <Navigation />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-bold pt-4" style={{ color: 'var(--color-text)' }}>統計</h1>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '総冊数', value: stats.totalBooks, unit: '冊' },
            { label: '今年', value: stats.booksThisYear, unit: '冊' },
            { label: '今月', value: stats.booksThisMonth, unit: '冊' },
            { label: '月平均', value: stats.averageBooksPerMonth, unit: '冊' },
          ].map(card => (
            <div key={card.label} className="rounded-2xl border p-4 text-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{card.label}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                {card.value}<span className="text-sm font-normal">{card.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* ストリーク */}
        <div className="rounded-2xl border p-4 flex gap-6" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="text-center flex-1">
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>現在のストリーク</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.currentStreak}週</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>最長ストリーク</p>
            <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>{stats.longestStreak}週</p>
          </div>
        </div>

        {/* 月別バーチャート */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="font-semibold mb-3">月別読了数（過去12ヶ月）</p>
          <MonthlyBarChart data={monthly12} />
        </div>

        {/* 年間ヒートマップ */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="font-semibold mb-3">読書カレンダー（今年）</p>
          <div className="pl-5">
            <YearHeatmap finishedDates={finishedDates} />
          </div>
        </div>

        {/* ジャンル分布 */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="font-semibold mb-3">ジャンル分布</p>
          <GenrePieChart genreData={genreData} />
        </div>

        {stats.favoriteGenre && (
          <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
              お気に入りジャンル: <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{stats.favoriteGenre}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
