-- TravelPack itineraries: expiring 3 days after trip end
create extension if not exists pgcrypto;

create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  public_id uuid not null default gen_random_uuid() unique,
  trip_id text not null,
  trip_title text,
  start_date date not null,
  end_date date not null,
  days jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz generated always as ((end_date + interval '3 days')::timestamptz) stored
);

alter table public.itineraries enable row level security;

-- Lock down any old policies if present (reads/writes only via Edge Functions)
drop policy if exists itineraries_select on public.itineraries;
drop policy if exists itineraries_insert on public.itineraries;
drop policy if exists itineraries_update on public.itineraries;
drop policy if exists itineraries_delete on public.itineraries;

create index if not exists itineraries_public_id_idx on public.itineraries(public_id);
create index if not exists itineraries_expires_at_idx on public.itineraries(expires_at);