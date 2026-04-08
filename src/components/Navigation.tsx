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
      <aside className="hidden lg:flex flex-col w-60 min-h-screen border-r bg-white fixed top-0 left-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            📚 BookLog
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                pathname === item.href
                  ? 'text-white'
                  : 'hover:bg-gray-50'
              }`}
              style={pathname === item.href ? { background: 'var(--color-primary)' } : { color: 'var(--color-text)' }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2" style={{ borderColor: 'var(--color-border)' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full justify-start"
          >
            {theme === 'dark' ? '☀️ ライトモード' : '🌙 ダークモード'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-red-500 hover:text-red-600"
          >
            ログアウト
          </Button>
        </div>
      </aside>

      {/* スマホ用ボトムナビ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex" style={{ borderColor: 'var(--color-border)' }}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              pathname === item.href ? '' : ''
            }`}
            style={{ color: pathname === item.href ? 'var(--color-primary)' : 'var(--color-subtext)' }}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
