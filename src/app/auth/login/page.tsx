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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>📚 BookLog</h1>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>読書記録アプリへようこそ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="mt-1"
            />
          </div>
          <Button
            type="submit"
            className="w-full font-semibold"
            style={{ background: 'var(--color-primary)', color: 'white' }}
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-subtext)' }}>
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/register" className="font-medium underline" style={{ color: 'var(--color-primary)' }}>
            アカウントを作成
          </Link>
        </p>
      </div>
    </div>
  )
}
