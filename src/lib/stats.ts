import { Book, MonthlyData, UserStats } from './types'

/**
 * 週のキーを返す（月曜始まり）
 */
function getWeekKey(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

/**
 * 週単位のストリークを計算（読了済みの本のみ対象）
 */
export function calculateStreak(books: Book[]): { current: number; longest: number } {
  const finishedBooks = books.filter(b => b.status === 'finished' && b.finishedAt)
  if (finishedBooks.length === 0) return { current: 0, longest: 0 }

  const weekSet = new Set<string>()
  finishedBooks.forEach(book => {
    const date = new Date(book.finishedAt!)
    weekSet.add(getWeekKey(date))
  })

  const weeks = Array.from(weekSet).sort().reverse()

  // 今週と先週のキー
  const now = new Date()
  const thisWeek = getWeekKey(now)
  const lastWeek = new Date(now)
  lastWeek.setDate(now.getDate() - 7)
  const lastWeekKey = getWeekKey(lastWeek)

  // 現在ストリークの計算（今週または先週から始まる）
  let current = 0
  if (weeks[0] === thisWeek || weeks[0] === lastWeekKey) {
    current = 1
    for (let i = 1; i < weeks.length; i++) {
      const prev = new Date(weeks[i - 1])
      const curr = new Date(weeks[i])
      const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays === 7) {
        current++
      } else {
        break
      }
    }
  }

  // 最長ストリークの計算
  let longest = 1
  let tempStreak = 1
  for (let i = 1; i < weeks.length; i++) {
    const prev = new Date(weeks[i - 1])
    const curr = new Date(weeks[i])
    const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays === 7) {
      tempStreak++
      longest = Math.max(longest, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return { current, longest: Math.max(longest, current) }
}

/**
 * 月別読了数を計算（読了済みの本のみ）
 */
export function getMonthlyData(books: Book[], months: number = 12): MonthlyData[] {
  const result: MonthlyData[] = []
  const now = new Date()
  const finishedBooks = books.filter(b => b.status === 'finished' && b.finishedAt)

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.toISOString().slice(0, 7)
    const count = finishedBooks.filter(b => b.finishedAt!.startsWith(month)).length
    result.push({ month, count })
  }

  return result
}

/**
 * 全統計データを計算
 */
export function calculateStats(books: Book[]): UserStats {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.toISOString().slice(0, 7)

  const finishedBooks = books.filter(b => b.status === 'finished' && b.finishedAt)
  const booksReading = books.filter(b => b.status === 'reading').length

  const booksThisYear = finishedBooks.filter(b => b.finishedAt!.startsWith(String(currentYear))).length
  const booksThisMonth = finishedBooks.filter(b => b.finishedAt!.startsWith(currentMonth)).length

  const { current: currentStreak, longest: longestStreak } = calculateStreak(books)

  // 過去3ヶ月の平均から年間予測
  const past3Months = getMonthlyData(books, 3)
  const avg3 = past3Months.reduce((sum, m) => sum + m.count, 0) / 3
  const predictedAnnualCount = Math.round(avg3 * 12)

  // 月平均（過去12ヶ月）
  const monthlyData = getMonthlyData(books, 12)
  const activeMonths = monthlyData.filter(m => m.count > 0).length
  const averageBooksPerMonth = activeMonths > 0
    ? Math.round((monthlyData.reduce((sum, m) => sum + m.count, 0) / 12) * 10) / 10
    : 0

  // お気に入りジャンル（読了本のみ）
  const genreCount = new Map<string, number>()
  finishedBooks.forEach(b => {
    if (b.genre) genreCount.set(b.genre, (genreCount.get(b.genre) ?? 0) + 1)
  })
  let favoriteGenre: string | null = null
  let maxGenreCount = 0
  genreCount.forEach((count, genre) => {
    if (count > maxGenreCount) {
      maxGenreCount = count
      favoriteGenre = genre
    }
  })

  return {
    totalBooks: finishedBooks.length,
    booksReading,
    booksThisYear,
    booksThisMonth,
    currentStreak,
    longestStreak,
    averageBooksPerMonth,
    predictedAnnualCount,
    favoriteGenre,
    monthlyData,
  }
}

/**
 * 達成バッジをチェック
 */
export function checkBadges(books: Book[]): string[] {
  const earned: string[] = []
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)
  const currentYear = now.getFullYear()

  const finishedBooks = books.filter(b => b.status === 'finished' && b.finishedAt)

  if (finishedBooks.length >= 1) earned.push('first_book')
  if (finishedBooks.length >= 3) earned.push('books_3')
  if (finishedBooks.length >= 10) earned.push('books_10')
  if (finishedBooks.length >= 50) earned.push('books_50')

  const booksThisMonth = finishedBooks.filter(b => b.finishedAt!.startsWith(currentMonth)).length
  if (booksThisMonth >= 5) earned.push('monthly_5')

  // speed_3: 過去12ヶ月いずれかの月で3冊以上
  const monthlyCounts = getMonthlyData(books, 12)
  if (monthlyCounts.some(m => m.count >= 3)) earned.push('speed_3')

  const booksThisYear = finishedBooks.filter(b => b.finishedAt!.startsWith(String(currentYear))).length
  if (booksThisYear >= 24) earned.push('annual_24')

  const { current } = calculateStreak(books)
  if (current >= 4) earned.push('streak_4')

  return earned
}
