'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Book, BookRow, AddBookInput, rowToBook } from '@/lib/types'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchBooks = useCallback(async () => {
    if (!user) return
    setLoading(true)
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
  }, [user])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const addBook = async (input: AddBookInput): Promise<Book | null> => {
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

    if (error) {
      toast.error('登録に失敗しました')
      return null
    }

    const newBook = rowToBook(data as BookRow)
    setBooks(prev => [newBook, ...prev])
    toast.success('📚 記録しました！')
    return newBook
  }

  const updateBook = async (id: string, input: Partial<AddBookInput>): Promise<boolean> => {
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

    if (error) {
      toast.error('更新に失敗しました')
      return false
    }

    await fetchBooks()
    toast.success('更新しました')
    return true
  }

  const deleteBook = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('削除に失敗しました')
      return false
    }

    setBooks(prev => prev.filter(b => b.id !== id))
    toast.success('削除しました')
    return true
  }

  return { books, loading, addBook, updateBook, deleteBook, refetch: fetchBooks }
}
