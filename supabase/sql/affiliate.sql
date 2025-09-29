create table if not exists public.affiliate_links(
  slug text primary key,
  url text not null,
  label text,
  created_at timestamptz default now()
);

create table if not exists public.affiliate_clicks(
  id bigserial primary key,
  slug text not null references public.affiliate_links(slug) on delete cascade,
  ts timestamptz default now(),
  ua text,
  referrer text
);

alter table public.affiliate_links enable row level security;
alter table public.affiliate_clicks enable row level security;

-- Allow read access to links for anon (public site)
create policy if not exists affiliate_links_read on public.affiliate_links
for select to anon using (true);
