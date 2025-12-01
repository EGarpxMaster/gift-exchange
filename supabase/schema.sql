-- Create settings table
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  encryption_password_hash text not null,
  names_revealed boolean default false not null,
  sorteo_completed boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings row
insert into public.settings (encryption_password_hash, names_revealed, sorteo_completed)
values ('default', false, false);

-- Create participants table
create table public.participants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  encrypted_name text not null,
  category text not null check (category in ('elite', 'diversion')),
  gift_options jsonb not null default '[]'::jsonb,
  assigned_to_id uuid references public.participants(id),
  constraint unique_encrypted_name unique (encrypted_name)
);

-- Enable Row Level Security (RLS)
alter table public.participants enable row level security;
alter table public.settings enable row level security;

-- Policies for participants
create policy "Enable insert for everyone" on public.participants for insert with check (true);
create policy "Enable read for everyone" on public.participants for select using (true);
create policy "Enable update for everyone" on public.participants for update using (true);

-- Policies for settings
create policy "Enable read for everyone" on public.settings for select using (true);
create policy "Enable update for everyone" on public.settings for update using (true);
