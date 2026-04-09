'use client'

import { useState, useMemo } from 'react'
import { useBooks } from '@/hooks/useBooks'
import BookCard from '@/components/BookCard'
import Navigation from '@/components/Navigation'
import AddBookForm from '@/components/AddBookForm'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const GENRES = ['小説', 'ビジネス', '自己啓発', '技術', '歴史', '科学', '哲学', '伝記', 'SF', 'ミステリ', 'エッセイ', 'その他']

export default function BooksPage() {
  const { books, loading, addBook, updateBook, deleteBook } = useBooks()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')
  const [filterGenre, setFilterGenre] = useState('')
  const [filterRating, setFilterRating] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const filtered = useMemo(() => {
    let result = [...books]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.author?.toLowerCase().includes(q) ?? false)
      )
    }

    if (filterGenre) result = result.filter(b => b.genre === filterGenre)
    if (filterRating) result = result.filter(b => b.rating === Number(filterRating))

    switch (sortBy) {
      case 'date_desc':
        result.sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
        break
      case 'date_asc':
        result.sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ja'))
        break
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
    }

    return result
  }, [books, search, sortBy, filterGenre, filterRating])

  return (
    <div className="lg:ml-60 pb-20 lg:pb-0">
      <Navigation />
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between pt-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>本棚</h1>
          <span className="text-sm" style={{ color: 'var(--color-subtext)' }}>全{books.length}冊</span>
        </div>

        {/* 検索・フィルター */}
        <div className="space-y-2">
          <Input
            placeholder="タイトル・著者で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? 'date_desc')}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">読了日（新しい順）</SelectItem>
                <SelectItem value="date_asc">読了日（古い順）</SelectItem>
                <SelectItem value="title">タイトル（50音順）</SelectItem>
                <SelectItem value="rating">評価順</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGenre} onValueChange={(v) => setFilterGenre(v === 'all' ? '' : (v ?? ''))}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="ジャンル" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterRating} onValueChange={(v) => setFilterRating(v === 'all' ? '' : (v ?? ''))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="評価" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="5">⭐5</SelectItem>
                <SelectItem value="4">⭐4</SelectItem>
                <SelectItem value="3">⭐3</SelectItem>
                <SelectItem value="2">⭐2</SelectItem>
                <SelectItem value="1">⭐1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-8" style={{ color: 'var(--color-subtext)' }}>読み込み中...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">📚</p>
            <p style={{ color: 'var(--color-subtext)' }}>
              {books.length === 0 ? 'まだ本が登録されていません' : '検索結果がありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(book => (
              <BookCard key={book.id} book={book} onUpdate={updateBook} onDelete={deleteBook} />
            ))}
          </div>
        )}
      </main>

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
