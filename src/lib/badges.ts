import { Badge } from './types'

export const BADGE_DEFINITIONS: Omit<Badge, 'earnedAt'>[] = [
  { key: 'first_book', name: 'はじめの一冊', description: '初めての登録', icon: '📖' },
  { key: 'books_3', name: '三日坊主卒業', description: '3冊登録', icon: '🌱' },
  { key: 'books_10', name: '本の虫', description: '10冊登録', icon: '📚' },
  { key: 'books_50', name: '読書家', description: '50冊登録', icon: '🔥' },
  { key: 'monthly_5', name: '月間チャンピオン', description: '1ヶ月で5冊以上', icon: '📅' },
  { key: 'annual_24', name: '年間読書家', description: '1年で24冊以上', icon: '🗓️' },
  { key: 'speed_3', name: '速読家', description: '同じ月に3冊以上', icon: '⚡' },
  { key: 'streak_4', name: '継続は力', description: 'ストリーク4週連続', icon: '🏅' },
]
