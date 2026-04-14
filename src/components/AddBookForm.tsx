'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddBookInput } from '@/lib/types'
import { toast } from 'sonner'

interface OpenLibraryResult {
  title: string
  author_name?: string[]
  number_of_pages_median?: number
  cover_i?: number
}

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (input: AddBookInput) => Promise<unknown>
}

const DRAFT_KEY = 'booklog_draft'

interface Draft {
  title: string
  status: 'reading' | 'finished'
  startedAt: string
  finishedAt: string
  author: string
  genre: string
  rating: string
  memo: string
  pageCount: string
}

const getToday = () => new Date().toISOString().slice(0, 10)

const saveDraft = (draft: Draft) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // localStorage が使えない環境では無視
  }
}

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}

const loadDraft = (): Draft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Draft) : null
  } catch {
    return null
  }
}

export default function AddBookForm({ open, onClose, onAdd }: Props) {
  const [status, setStatus] = useState<'reading' | 'finished'>('finished')
  const [title, setTitle] = useState('')
  const [startedAt, setStartedAt] = useState(getToday)
  const [finishedAt, setFinishedAt] = useState(getToday)
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [rating, setRating] = useState('')
  const [memo, setMemo] = useState('')
  const [pageCount, setPageCount] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<OpenLibraryResult[]>([])
  const [searching, setSearching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (open) {
      const draft = loadDraft()
      if (draft && draft.title) {
        setTitle(draft.title)
        setStatus(draft.status ?? 'finished')
        setStartedAt(draft.startedAt || getToday())
        setFinishedAt(draft.finishedAt || getToday())
        setAuthor(draft.author)
        setGenre(draft.genre)
        setRating(draft.rating)
        setMemo(draft.memo)
        setPageCount(draft.pageCount)
        toast('前回の入力内容を復元しました')
      } else {
        setTitle('')
        setStatus('finished')
        setStartedAt(getToday())
        setFinishedAt(getToday())
        setAuthor('')
        setGenre('')
        setRating('')
        setMemo('')
        setPageCount('')
      }
      setSuggestions([])
    }
  }, [open])

  const getDraft = (): Draft => ({
    title, status, startedAt, finishedAt, author, genre, rating, memo, pageCount
  })

  const searchOpenLibrary = async () => {
    if (!title.trim()) return
    // 前のリクエストをキャンセル
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setSearching(true)
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=3`,
        { signal: controller.signal }
      )
      const data = await res.json()
      setSuggestions(data.docs?.slice(0, 3) ?? [])
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        toast.error('書籍情報の検索に失敗しました')
      }
    } finally {
      setSearching(false)
    }
  }

  const applySuggestion = (s: OpenLibraryResult) => {
    const newAuthor = s.author_name?.[0] ?? author
    const newPageCount = s.number_of_pages_median ? String(s.number_of_pages_median) : pageCount
    if (s.author_name?.[0]) setAuthor(newAuthor)
    if (s.number_of_pages_median) setPageCount(newPageCount)
    setSuggestions([])
    saveDraft({ ...getDraft(), author: newAuthor, pageCount: newPageCount })
    toast.success('情報を入力しました')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('タイトルは必須です')
      return
    }
    const today = getToday()
    if (status === 'finished') {
      if (!finishedAt) {
        toast.error('読了日は必須です')
        return
      }
      if (finishedAt > today) {
        toast.error('未来の日付は指定できません')
        return
      }
    }

    setLoading(true)
    await onAdd({
      title: title.trim(),
      status,
      startedAt: startedAt || undefined,
      finishedAt: status === 'finished' ? finishedAt : null,
      author: author.trim() || undefined,
      genre: (genre && genre !== 'small-library-item') ? genre : undefined,
      rating: (rating && rating !== 'no-rating') ? Number(rating) : undefined,
      memo: memo.trim() || undefined,
      pageCount: pageCount ? Number(pageCount) : undefined,
    })
    clearDraft()
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📚 読書記録を追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* ステータス切替トグル */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            {(['reading', 'finished'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s)
                  saveDraft({ ...getDraft(), status: s })
                }}
                className="flex-1 py-2.5 text-sm font-medium transition-colors"
                style={status === s
                  ? { background: 'var(--color-primary)', color: 'white' }
                  : { background: 'var(--color-card)', color: 'var(--color-subtext)' }
                }
              >
                {s === 'reading' ? '📖 読書中' : '✅ 読了'}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="title">タイトル *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="title"
                value={title}
                onChange={e => {
                  setTitle(e.target.value)
                  saveDraft({ ...getDraft(), title: e.target.value })
                }}
                placeholder="本のタイトル"
                maxLength={200}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchOpenLibrary}
                disabled={searching || !title.trim()}
                className="shrink-0"
              >
                {searching ? '検索中' : '検索'}
              </Button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-subtext)' }}>
              ※ 英語タイトルで検索すると候補が見つかりやすいです
            </p>
          </div>

          {suggestions.length > 0 && (
            <div className="border rounded-lg p-3 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--color-subtext)' }}>候補から選択:</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="w-full text-left p-2 rounded text-sm transition-colors"
                  style={{ color: 'var(--color-text)' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'var(--color-border)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="font-medium">{s.title}</div>
                  {s.author_name?.[0] && (
                    <div style={{ color: 'var(--color-subtext)' }}>{s.author_name[0]}</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {status === 'reading' ? (
            <div>
              <Label htmlFor="startedAt">開始日</Label>
              <Input
                id="startedAt"
                type="date"
                value={startedAt}
                onChange={e => {
                  setStartedAt(e.target.value)
                  saveDraft({ ...getDraft(), startedAt: e.target.value })
                }}
                max={getToday()}
                className="mt-1"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="finishedAt">読了日 *</Label>
              <Input
                id="finishedAt"
                type="date"
                value={finishedAt}
                onChange={e => {
                  setFinishedAt(e.target.value)
                  saveDraft({ ...getDraft(), finishedAt: e.target.value })
                }}
                max={getToday()}
                required
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="author">著者</Label>
            <Input
              id="author"
              value={author}
              onChange={e => {
                setAuthor(e.target.value)
                saveDraft({ ...getDraft(), author: e.target.value })
              }}
              placeholder="著者名"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="genre">ジャンル</Label>
            <Select value={genre} onValueChange={(v) => {
              const val = v ?? ''
              setGenre(val)
              saveDraft({ ...getDraft(), genre: val })
            }}>
              <SelectTrigger id="genre" className="mt-1">
                <SelectValue placeholder="ジャンルを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ジャンルなし</SelectItem>
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
            <Label htmlFor="rating">評価</Label>
            <Select value={rating} onValueChange={(v) => {
              const val = v ?? ''
              setRating(val)
              saveDraft({ ...getDraft(), rating: val })
            }}>
              <SelectTrigger id="rating" className="mt-1">
                <SelectValue placeholder="評価を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">評価なし</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                <SelectItem value="2">⭐⭐ 2</SelectItem>
                <SelectItem value="1">⭐ 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pageCount">ページ数</Label>
            <Input
              id="pageCount"
              type="number"
              value={pageCount}
              onChange={e => {
                setPageCount(e.target.value)
                saveDraft({ ...getDraft(), pageCount: e.target.value })
              }}
              placeholder="例: 320"
              min={1}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="memo">メモ（2000文字以内）</Label>
            <textarea
              id="memo"
              value={memo}
              onChange={e => {
                setMemo(e.target.value)
                saveDraft({ ...getDraft(), memo: e.target.value })
              }}
              placeholder="感想・メモ"
              maxLength={2000}
              rows={10}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm resize-y"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
            <p className="text-xs text-right" style={{ color: 'var(--color-subtext)' }}>{memo.length}/2000</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { clearDraft(); onClose() }} className="flex-1">
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ background: 'var(--color-primary)', color: 'white' }}
              disabled={loading}
            >
              {loading ? '登録中...' : '登録する'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
