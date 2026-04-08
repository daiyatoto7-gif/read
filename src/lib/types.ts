// Supabaseから返る書籍データ（snake_case）
export interface BookRow {
  id: string;
  user_id: string;
  title: string;
  finished_at: string;       // YYYY-MM-DD
  author: string | null;
  genre: string | null;
  rating: number | null;
  memo: string | null;
  page_count: number | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

// アプリ内で使う書籍データ（camelCase）
export interface Book {
  id: string;
  userId: string;
  title: string;
  finishedAt: string;
  author?: string;
  genre?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  memo?: string;
  pageCount?: number;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 新規登録時の入力
export interface AddBookInput {
  title: string;             // 必須
  finishedAt: string;        // 必須（デフォルト: 今日）
  author?: string;
  genre?: string;
  rating?: number;
  memo?: string;
  pageCount?: number;
  coverUrl?: string;
}

// ユーザー設定
export interface UserSettings {
  monthlyGoal: number | null;
  notificationEnabled: boolean;
  notificationDay: number;
  notificationTime: string;
}

// 実績バッジ
export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;   // null = 未獲得
}

// 統計データ
export interface MonthlyData {
  month: string;             // "2024-03"
  count: number;
}

export interface UserStats {
  totalBooks: number;
  booksThisYear: number;
  booksThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  averageBooksPerMonth: number;
  predictedAnnualCount: number;
  favoriteGenre: string | null;
  monthlyData: MonthlyData[];
}

// BookRowからBookへの変換
export function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    finishedAt: row.finished_at,
    author: row.author ?? undefined,
    genre: row.genre ?? undefined,
    rating: row.rating as Book['rating'],
    memo: row.memo ?? undefined,
    pageCount: row.page_count ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
