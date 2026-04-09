'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBooks } from '@/hooks/useBooks'
import { BADGE_DEFINITIONS } from '@/lib/badges'
import { createClient } from '@/lib/supabase/client'
import { checkBadges } from '@/lib/stats'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { books } = useBooks()
  const { theme, setTheme } = useTheme()
  const [monthlyGoal, setMonthlyGoal] = useState('')
  const [saving, setSaving] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [notificationDay, setNotificationDay] = useState('0')
  const [notificationTime, setNotificationTime] = useState('20:00')
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setMonthlyGoal(data.monthly_goal ? String(data.monthly_goal) : '')
        setNotificationEnabled(data.notification_enabled ?? false)
        setNotificationDay(String(data.notification_day ?? 0))
        setNotificationTime(data.notification_time ?? '20:00')
      }
    }
    fetchSettings()

    const fetchBadges = async () => {
      const { data } = await supabase
        .from('badges')
        .select('badge_key')
        .eq('user_id', user.id)
      setEarnedBadges((data ?? []).map((b: { badge_key: string }) => b.badge_key))
    }
    fetchBadges()
  }, [user])

  const saveSettings = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        monthly_goal: monthlyGoal ? Number(monthlyGoal) : null,
        notification_enabled: notificationEnabled,
        notification_day: Number(notificationDay),
        notification_time: notificationTime,
      })
    if (error) {
      toast.error('保存に失敗しました')
    } else {
      toast.success('設定を保存しました')
    }
    setSaving(false)
  }

  const exportJSON = () => {
    const json = JSON.stringify(books, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booklog_export_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const header = 'タイトル,著者,ジャンル,評価,読了日,ページ数,メモ'
    const rows = books.map(b =>
      [
        `"${(b.title ?? '').replace(/"/g, '""')}"`,
        `"${(b.author ?? '').replace(/"/g, '""')}"`,
        `"${(b.genre ?? '').replace(/"/g, '""')}"`,
        b.rating ?? '',
        b.finishedAt,
        b.pageCount ?? '',
        `"${(b.memo ?? '').replace(/"/g, '""')}"`,
      ].join(',')
    )
    const csv = '\uFEFF' + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booklog_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('このブラウザは通知に対応していません')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationEnabled(true)
      toast.success('通知を許可しました')
    } else {
      toast.error('通知が拒否されました')
    }
  }

  const earnedSet = new Set(earnedBadges)
  const shouldEarn = new Set(checkBadges(books))

  const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

  return (
    <div className="lg:ml-60 pb-20 lg:pb-0">
      <Navigation />
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <h1 className="text-xl font-bold pt-4" style={{ color: 'var(--color-text)' }}>設定</h1>

        {/* ユーザー情報 */}
        <section className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold">アカウント</h2>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>{user?.email}</p>
          <Button variant="outline" onClick={signOut} className="text-red-500 border-red-200 hover:bg-red-50">
            ログアウト
          </Button>
        </section>

        {/* 月間目標 */}
        <section className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold">月間目標</h2>
          <div>
            <Label htmlFor="goal">1ヶ月に読む冊数の目標</Label>
            <Input
              id="goal"
              type="number"
              value={monthlyGoal}
              onChange={e => setMonthlyGoal(e.target.value)}
              placeholder="例: 5"
              min={1}
              max={100}
              className="mt-1 w-32"
            />
          </div>
          <Button
            onClick={saveSettings}
            disabled={saving}
            style={{ background: 'var(--color-primary)', color: 'white' }}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </section>

        {/* テーマ */}
        <section className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold">テーマ</h2>
          <Select value={theme ?? 'system'} onValueChange={(v) => setTheme(v ?? 'system')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">システム設定に従う</SelectItem>
              <SelectItem value="light">ライトモード</SelectItem>
              <SelectItem value="dark">ダークモード</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* 通知設定 */}
        <section className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold">リマインダー通知</h2>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
            ※ HTTPS環境（Vercelデプロイ後）でのみ動作します
          </p>
          {!notificationEnabled ? (
            <Button variant="outline" onClick={requestNotificationPermission}>
              通知を有効にする
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-green-600">✅ 通知が有効です</p>
              <div className="flex gap-3 items-end">
                <div>
                  <Label>通知する曜日</Label>
                  <Select value={notificationDay} onValueChange={(v) => setNotificationDay(v ?? '0')}>
                    <SelectTrigger className="mt-1 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((name, i) => (
                        <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>通知時刻</Label>
                  <Input
                    type="time"
                    value={notificationTime}
                    onChange={e => setNotificationTime(e.target.value)}
                    className="mt-1 w-28"
                  />
                </div>
              </div>
              <Button
                onClick={saveSettings}
                disabled={saving}
                style={{ background: 'var(--color-primary)', color: 'white' }}
              >
                {saving ? '保存中...' : '通知設定を保存'}
              </Button>
            </div>
          )}
        </section>

        {/* バッジ一覧 */}
        <section className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold">実績バッジ</h2>
          <div className="grid grid-cols-2 gap-3">
            {BADGE_DEFINITIONS.map(badge => {
              const earned = earnedSet.has(badge.key) || shouldEarn.has(badge.key)
              return (
                <div
                  key={badge.key}
                  className={`rounded-xl border p-3 ${earned ? '' : 'opacity-40'}`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <p className="text-2xl">{badge.icon}</p>
                  <p className="font-medium text-sm mt-1">{badge.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>{badge.description}</p>
                  {earned && <p className="text-xs text-green-600 mt-1">✅ 獲得済み</p>}
                </div>
              )
            })}
          </div>
        </section>

        {/* データ管理 */}
        <section className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold">データ管理</h2>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>
            全{books.length}冊のデータをエクスポートできます
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportJSON} disabled={books.length === 0}>
              JSONでエクスポート
            </Button>
            <Button variant="outline" onClick={exportCSV} disabled={books.length === 0}>
              CSVでエクスポート
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
