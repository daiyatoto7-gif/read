'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

const navItems = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/books', label: '本棚', icon: '📚' },
  { href: '/stats', label: '統計', icon: '📊' },
  { href: '/settings', label: '設定', icon: '⚙️' },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  return (
    <>
      {/* PC用サイドバー */}
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen border-r fixed top-0 left-0"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Link href="/" className="flex items-center gap-2">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl text-lg"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), #3DAA28)' }}
            >
              📚
            </span>
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              BookLog
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-sm"
                style={
                  active
                    ? {
                        background: 'var(--color-primary)',
                        color: 'white',
                      }
                    : {
                        color: 'var(--color-subtext)',
                      }
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t space-y-0.5" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--color-subtext)' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
            <span>{theme === 'dark' ? 'ライトモード' : 'ダークモード'}</span>
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-400 hover:text-red-300"
          >
            <span>↩</span>
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* スマホ用ボトムナビ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 border-t z-50 flex"
        style={{
          background: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors gap-0.5"
              style={{ color: active ? 'var(--color-primary)' : 'var(--color-subtext)' }}
            >
              <span className="text-xl leading-tight">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
