'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('パスワードは8文字以上で入力してください')
      return
    }
    if (password !== confirmPassword) {
      toast.error('パスワードが一致しません')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      toast.error('登録に失敗しました: ' + error.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  const inputStyle = {
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
  }

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 shadow-2xl text-center"
          style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
        >
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            確認メールを送信しました
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--color-subtext)' }}>
            {email} に確認メールを送信しました。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <p className="text-xs" style={{ color: 'var(--color-subtext)' }}>
            ※ 確認メールが不要な場合は、Supabaseダッシュボードの
            Authentication → Settings で「Confirm email」を無効化してください。
          </p>
          <Link href="/auth/login">
            <Button
              className="mt-6 w-full h-11 font-semibold"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              ログインページへ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(90,201,64,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(240,168,50,0.05) 0%, transparent 60%)',
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), #3DAA28)' }}
          >
            📚
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            BookLog
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
            新規アカウント作成
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--color-text)' }} htmlFor="email">
              メールアドレス
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="mt-1.5"
              style={inputStyle}
            />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--color-text)' }} htmlFor="password">
              パスワード（8文字以上）
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8文字以上のパスワード"
              required
              minLength={8}
              className="mt-1.5"
              style={inputStyle}
            />
          </div>
          <div>
            <Label className="text-sm font-medium" style={{ color: 'var(--color-text)' }} htmlFor="confirmPassword">
              パスワード（確認）
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力"
              required
              className="mt-1.5"
              style={inputStyle}
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold h-11 mt-2"
            style={{ background: 'var(--color-primary)', color: 'white' }}
            disabled={loading}
          >
            {loading ? '登録中...' : 'アカウントを作成'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-subtext)' }}>
          すでにアカウントをお持ちの方は{' '}
          <Link
            href="/auth/login"
            className="font-medium underline underline-offset-4"
            style={{ color: 'var(--color-primary)' }}
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
