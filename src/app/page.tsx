'use client'

import { useState, useEffect } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { useAuth } from '@/hooks/useAuth'
import { calculateStats, checkBadges } from '@/lib/stats'
import { getDailyQuote } from '@/lib/quotes'
import { BADGE_DEFINITIONS } from '@/lib/badges'
import { createClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'
import AddBookForm from '@/components/AddBookForm'
import BookCard from '@/components/BookCard'
import StreakBadge from '@/components/StreakBadge'
import Navigation from '@/components/Navigation'
import { MonthlyBarChart } from '@/components/StatsChart'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { books, loading, addBook, updateBook, deleteBook } = useBooks()
  const { user } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null)
  const supabase = createClient()

  const stats = calculateStats(books)
  const quote = getDailyQuote()

  useEffect(() => {
    if (!user) return
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('monthly_goal')
        .eq('user_id', user.id)
        .single()
      if (data) setMonthlyGoal(data.monthly_goal)
    }
    fetchSettings()
  }, [user])

  useEffect(() => {
    if (!user || books.length === 0) return
    const fetchAndCheckBadges = async () => {
      const { data: existing } = await supabase
        .from('badges')
        .select('badge_key')
        .eq('user_id', user.id)
      const existingKeys = (existing ?? []).map((b: { badge_key: string }) => b.badge_key)

      const shouldEarn = checkBadges(books)
      const newBadges = shouldEarn.filter(k => !existingKeys.includes(k))

      for (const key of newBadges) {
        await supabase.from('badges').upsert({ user_id: user.id, badge_key: key })
        const def = BADGE_DEFINITIONS.find(b => b.key === key)
        if (def) toast.success(`🏆 バッジ獲得！${def.icon} ${def.name}`)
      }
    }
    fetchAndCheckBadges()
  }, [books, user])

  useEffect(() => {
    if (monthlyGoal && stats.booksThisMonth >= monthlyGoal) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [stats.booksThisMonth, monthlyGoal])

  const progressPercent = monthlyGoal
    ? Math.min(100, Math.round((stats.booksThisMonth / monthlyGoal) * 100))
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p style={{ color: 'var(--color-subtext)' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="lg:ml-60 pb-20 lg:pb-0">
      <Navigation />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>ダッシュボード</h1>
        </div>

        {/* 今月の進捗 */}
        <div className="rounded-2xl border p-4 space-y-2" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex justify-between items-center">
            <p className="font-semibold">今月の読了</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {stats.booksThisMonth}冊
            </p>
          </div>
          {monthlyGoal ? (
            <>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
                目標 {monthlyGoal}冊 まで残り {Math.max(0, monthlyGoal - stats.booksThisMonth)}冊 ({progressPercent}%)
                {stats.booksThisMonth >= monthlyGoal && ' 🎉 達成！'}
              </p>
            </>
          ) : (
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
              設定ページで月間目標を設定できます
            </p>
          )}
        </div>

        {/* ストリーク */}
        <StreakBadge currentStreak={stats.currentStreak} longestStreak={stats.longestStreak} />

        {/* 読書ペース予測 */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="font-semibold mb-1">読書ペース予測</p>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
            このペースだと年間約 <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>{stats.predictedAnnualCount}冊</span> 読了できます
          </p>
          {monthlyGoal && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
              {stats.predictedAnnualCount >= monthlyGoal * 12
                ? '✅ 目標達成ペースです'
                : `📈 月に+${Math.ceil((monthlyGoal * 12 - stats.predictedAnnualCount) / 12)}冊で目標達成できます`}
            </p>
          )}
        </div>

        {/* 月別グラフ */}
        <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <p className="font-semibold mb-3">今年の月別読了数</p>
          <MonthlyBarChart data={stats.monthlyData} />
        </div>

        {/* 最近読んだ本 */}
        <div>
          <p className="font-semibold mb-3">最近読んだ本</p>
          {books.length === 0 ? (
            <div className="rounded-2xl border p-8 text-center" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <p className="text-4xl mb-2">📖</p>
              <p style={{ color: 'var(--color-subtext)' }}>まだ記録がありません</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>下のボタンから最初の1冊を記録しましょう</p>
            </div>
          ) : (
            <div className="space-y-3">
              {books.slice(0, 3).map(book => (
                <BookCard key={book.id} book={book} onUpdate={updateBook} onDelete={deleteBook} />
              ))}
            </div>
          )}
        </div>

        {/* 今日の名言 */}
        <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-accent)' }}>📖 今日の名言</p>
          <p className="text-sm italic" style={{ color: 'var(--color-text)' }}>"{quote.text}"</p>
          <p className="text-xs mt-2 text-right" style={{ color: 'var(--color-subtext)' }}>— {quote.author}</p>
        </div>
      </main>

      {/* フローティングボタン */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 lg:bottom-8 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl z-40 transition-transform hover:scale-110"
        style={{ background: 'var(--color-primary)', color: 'white' }}
        aria-label="記録する"
      >
        +
      </button>

      <AddBookForm open={showAddForm} onClose={() => setShowAddForm(false)} onAdd={addBook} />
    </div>
  )
}
