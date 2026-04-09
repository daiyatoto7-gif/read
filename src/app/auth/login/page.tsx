'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('メールアドレスまたはパスワードが違います')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* 背景グラデーション装飾 */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(90,201,64,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(240,168,50,0.05) 0%, transparent 60%)',
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), #3DAA28)' }}
          >
            📚
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            BookLog
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-subtext)' }}>
            読書記録アプリへようこそ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
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
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
            />
          </div>
          <div>
            <Label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="mt-1.5"
              style={{
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold h-11 mt-2"
            style={{ background: 'var(--color-primary)', color: 'white' }}
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-subtext)' }}>
          アカウントをお持ちでない方は{' '}
          <Link
            href="/auth/register"
            className="font-medium underline underline-offset-4"
            style={{ color: 'var(--color-primary)' }}
          >
            アカウントを作成
          </Link>
        </p>
      </div>
    </div>
  )
}
