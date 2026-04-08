-- ユーザーごとの設定テーブル
create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  monthly_goal integer default null,         -- 月間目標冊数
  notification_enabled boolean default false,
  notification_day integer default 0,   -- 0=日曜〜6=土曜
  notification_time text default '20:00',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 書籍テーブル
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,                       -- タイトル（必須）
  finished_at date not null,                 -- 読了日（必須）
  author text default null,                  -- 著者名
  genre text default null,                   -- ジャンル
  rating integer default null check (rating between 1 and 5), -- 評価
  memo text default null,                    -- メモ（200文字以内）
  page_count integer default null,           -- ページ数
  cover_url text default null,               -- 表紙画像URL
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 実績バッジテーブル
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_key text not null,                   -- バッジ識別子
  earned_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- RLS（Row Level Security）の有効化
alter table public.books enable row level security;
alter table public.user_settings enable row level security;
alter table public.badges enable row level security;

create policy "自分のbooksのみ操作可能" on public.books
  for all using (auth.uid() = user_id);

create policy "自分のsettingsのみ操作可能" on public.user_settings
  for all using (auth.uid() = user_id);

create policy "自分のbadgesのみ操作可能" on public.badges
  for all using (auth.uid() = user_id);

-- updated_at を自動更新するトリガー
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger books_updated_at before update on public.books
  for each row execute function update_updated_at();

create trigger settings_updated_at before update on public.user_settings
  for each row execute function update_updated_at();
