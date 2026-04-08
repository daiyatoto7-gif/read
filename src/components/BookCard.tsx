'use client'

import { useState } from 'react'
import { Book, AddBookInput } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  book: Book
  onUpdate: (id: string, input: Partial<AddBookInput>) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
}

function StarRating({ rating }: { rating?: number }) {
  return (
    <span className="text-yellow-400">
      {'⭐'.repeat(rating ?? 0)}
    </span>
  )
}

export default function BookCard({ book, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(book.title)
  const [finishedAt, setFinishedAt] = useState(book.finishedAt)
  const [author, setAuthor] = useState(book.author ?? '')
  const [genre, setGenre] = useState(book.genre ?? '')
  const [rating, setRating] = useState(book.rating ? String(book.rating) : '')
  const [memo, setMemo] = useState(book.memo ?? '')
  const [pageCount, setPageCount] = useState(book.pageCount ? String(book.pageCount) : '')

  const today = new Date().toISOString().slice(0, 10)

  const handleSave = async () => {
    await onUpdate(book.id, {
      title,
      finishedAt,
      author: author || undefined,
      genre: genre || undefined,
      rating: rating ? Number(rating) : undefined,
      memo: memo || undefined,
      pageCount: pageCount ? Number(pageCount) : undefined,
    })
    setEditing(false)
    setOpen(false)
  }

  const handleDelete = async () => {
    await onDelete(book.id)
    setConfirmDelete(false)
    setOpen(false)
  }

  return (
    <>
      <div
        className="bg-white rounded-2xl border p-4 cursor-pointer hover:shadow-md transition-shadow"
        style={{ borderColor: 'var(--color-border)' }}
        onClick={() => setOpen(true)}
      >
        <div className="flex gap-3">
          {book.coverUrl && (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-12 h-16 object-cover rounded-lg shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>{book.title}</h3>
            {book.author && (
              <p className="text-sm truncate" style={{ color: 'var(--color-subtext)' }}>{book.author}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: 'var(--color-subtext)' }}>{book.finishedAt}</span>
              {book.rating && <StarRating rating={book.rating} />}
              {book.genre && (
                <Badge variant="secondary" className="text-xs">{book.genre}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editing ? '編集' : '詳細'}</SheetTitle>
          </SheetHeader>

          {!editing ? (
            <div className="mt-4 space-y-4">
              {book.coverUrl && (
                <img src={book.coverUrl} alt={book.title} className="w-24 h-32 object-cover rounded-lg" />
              )}
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>タイトル</p>
                <p className="font-semibold">{book.title}</p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>読了日</p>
                <p>{book.finishedAt}</p>
              </div>
              {book.author && (
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>著者</p>
                  <p>{book.author}</p>
                </div>
              )}
              {book.genre && (
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>ジャンル</p>
                  <Badge variant="secondary">{book.genre}</Badge>
                </div>
              )}
              {book.rating && (
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>評価</p>
                  <StarRating rating={book.rating} />
                </div>
              )}
              {book.pageCount && (
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>ページ数</p>
                  <p>{book.pageCount}ページ</p>
                </div>
              )}
              {book.memo && (
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>メモ</p>
                  <p className="text-sm whitespace-pre-wrap">{book.memo}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button onClick={() => setEditing(true)} className="flex-1" style={{ background: 'var(--color-primary)', color: 'white' }}>
                  編集
                </Button>
                <Button variant="destructive" onClick={() => setConfirmDelete(true)} className="flex-1">
                  削除
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="edit-title">タイトル</Label>
                <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-date">読了日</Label>
                <Input id="edit-date" type="date" value={finishedAt} max={today} onChange={e => setFinishedAt(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-author">著者</Label>
                <Input id="edit-author" value={author} onChange={e => setAuthor(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>ジャンル</Label>
                <Select value={genre} onValueChange={(v) => setGenre(v ?? "")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="ジャンルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ジャンルなし</SelectItem>
                    <SelectItem value="小説">小説</SelectItem>
                    <SelectItem value="ビジネス">ビジネス</SelectItem>
                    <SelectItem value="自己啓発">自己啓発</SelectItem>
                    <SelectItem value="技術">技術</SelectItem>
                    <SelectItem value="歴史">歴史</SelectItem>
                    <SelectItem value="科学">科学</SelectItem>
                    <SelectItem value="哲学">哲学</SelectItem>
                    <SelectItem value="伝記">伝記</SelectItem>
                    <SelectItem value="SF">SF</SelectItem>
                    <SelectItem value="ミステリ">ミステリ</SelectItem>
                    <SelectItem value="エッセイ">エッセイ</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>評価</Label>
                <Select value={rating} onValueChange={(v) => setRating(v ?? "")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="評価を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">評価なし</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                    <SelectItem value="2">⭐⭐ 2</SelectItem>
                    <SelectItem value="1">⭐ 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-pages">ページ数</Label>
                <Input id="edit-pages" type="number" value={pageCount} onChange={e => setPageCount(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-memo">メモ</Label>
                <textarea
                  id="edit-memo"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-none"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">キャンセル</Button>
                <Button onClick={handleSave} className="flex-1" style={{ background: 'var(--color-primary)', color: 'white' }}>保存</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本を削除しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: 'var(--color-subtext)' }}>「{book.title}」の記録を削除します。この操作は取り消せません。</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1">キャンセル</Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">削除する</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
