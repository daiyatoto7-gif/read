'use client'

interface Props {
  currentStreak: number
  longestStreak: number
}

export default function StreakBadge({ currentStreak, longestStreak }: Props) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <span className={`text-3xl ${currentStreak > 0 ? 'animate-bounce' : ''}`}>
          {currentStreak > 0 ? '🔥' : '💤'}
        </span>
        <div>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {currentStreak}週連続
          </p>
          {currentStreak === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
              先週は記録がありませんでした。今週から再スタート！
            </p>
          ) : (
            <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
              最長記録: {longestStreak}週
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
