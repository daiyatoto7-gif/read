'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Book, BookRow, AddBookInput, rowToBook } from '@/lib/types'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface BooksContextValue {
  books: Book[]
  loading: boolean
  addBook: (input: AddBookInput) => Promise<Book | null>
  updateBook: (id: string, input: Partial<AddBookInput>) => Promise<boolean>
  deleteBook: (id: string) => Promise<boolean>
  refetch: () => Promise<void>
}

const BooksContext = createContext<BooksContextValue | null>(null)

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  // 初回のみloadingをtrueにし、2回目以降はバックグラウンド更新
  const initialLoadDone = useRef(false)

  const fetchBooks = useCallback(async () => {
    if (!user) return
    if (!initialLoadDone.current) {
      setLoading(true)
    }
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('finished_at', { ascending: false })

    if (error) {
      toast.error('書籍の取得に失敗しました')
      setLoading(false)
      return
    }

    setBooks((data as BookRow[]).map(rowToBook))
    setLoading(false)
    initialLoadDone.current = true
  }, [user, supabase])

  useEffect(() => {
    if (!user) {
      setBooks([])
      setLoading(true)
      initialLoadDone.current = false
      return
    }
    fetchBooks()
  }, [fetchBooks, user])

  const addBook = useCallback(async (input: AddBookInput): Promise<Book | null> => {
    if (!user) return null
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: user.id,
        title: input.title,
        finished_at: input.finishedAt,
        author: input.author ?? null,
        genre: input.genre ?? null,
        rating: input.rating ?? null,
        memo: input.memo ?? null,
        page_count: input.pageCount ?? null,
        cover_url: input.coverUrl ?? null,
      })
      .select()
      .single()

    if (error) { toast.error('登録に失敗しました'); return null }
    const newBook = rowToBook(data as BookRow)
    setBooks(prev => [newBook, ...prev])
    toast.success('📚 記録しました！')
    return newBook
  }, [user, supabase])

  const updateBook = useCallback(async (id: string, input: Partial<AddBookInput>): Promise<boolean> => {
    const { error } = await supabase
      .from('books')
      .update({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.finishedAt !== undefined && { finished_at: input.finishedAt }),
        ...(input.author !== undefined && { author: input.author ?? null }),
        ...(input.genre !== undefined && { genre: input.genre ?? null }),
        ...(input.rating !== undefined && { rating: input.rating ?? null }),
        ...(input.memo !== undefined && { memo: input.memo ?? null }),
        ...(input.pageCount !== undefined && { page_count: input.pageCount ?? null }),
        ...(input.coverUrl !== undefined && { cover_url: input.coverUrl ?? null }),
      })
      .eq('id', id)

    if (error) { toast.error('更新に失敗しました'); return false }
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...{
      title: input.title ?? b.title,
      finishedAt: input.finishedAt ?? b.finishedAt,
      author: input.author,
      genre: input.genre,
      rating: input.rating as Book['rating'],
      memo: input.memo,
      pageCount: input.pageCount,
    }} : b))
    toast.success('更新しました')
    return true
  }, [supabase])

  const deleteBook = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) { toast.error('削除に失敗しました'); return false }
    setBooks(prev => prev.filter(b => b.id !== id))
    toast.success('削除しました')
    return true
  }, [supabase])

  return (
    <BooksContext.Provider value={{ books, loading, addBook, updateBook, deleteBook, refetch: fetchBooks }}>
      {children}
    </BooksContext.Provider>
  )
}

export function useBooks() {
  const ctx = useContext(BooksContext)
  if (!ctx) throw new Error('useBooks must be used within BooksProvider')
  return ctx
}
