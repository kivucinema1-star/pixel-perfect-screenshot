create type public.app_role as enum ('admin');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role app_role not null, must_change_password boolean not null default false, unique(user_id, role));
grant select, update on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own role read" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "own role update" on public.user_roles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  logo_text text not null default '',
  nav_items jsonb not null default '[]',
  social_links jsonb not null default '[]',
  cta_heading text not null default '', cta_subtext text not null default '',
  whatsapp text not null default '', email text not null default '',
  footer_text text not null default '', copyright_text text not null default '',
  popup_heading text not null default '', popup_subtext text not null default '', popup_link text not null default '',
  popup_interval_sec int not null default 30, popup_duration_sec int not null default 5,
  updated_at timestamptz not null default now());
create table public.hero (
  id int primary key default 1 check (id = 1),
  headline text not null default '', subtext text not null default '',
  cta1_label text not null default '', cta1_link text not null default '',
  cta2_label text not null default '', cta2_link text not null default '',
  stats jsonb not null default '[]', updated_at timestamptz not null default now());
insert into public.site_settings (id) values (1);
insert into public.hero (id) values (1);

create table public.portfolio_items (id uuid primary key default gen_random_uuid(), title text not null default '', subtitle text not null default '', thumbnail_url text not null default '', video_url text not null default '', sort_order int not null default 0, created_at timestamptz not null default now());
create table public.services (id uuid primary key default gen_random_uuid(), title text not null default '', description text not null default '', tags text[] not null default '{}', sort_order int not null default 0, created_at timestamptz not null default now());
create table public.clients (id uuid primary key default gen_random_uuid(), name text not null default '', logo_url text not null default '', sort_order int not null default 0, created_at timestamptz not null default now());
create table public.team_members (id uuid primary key default gen_random_uuid(), name text not null default '', role text not null default '', photo_url text not null default '', sort_order int not null default 0, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['site_settings','hero','portfolio_items','services','clients','team_members'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin insert" on public.%I for insert to authenticated with check (public.has_role(auth.uid(), ''admin''))', t);
    execute format('create policy "admin update" on public.%I for update to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))', t);
    execute format('create policy "admin delete" on public.%I for delete to authenticated using (public.has_role(auth.uid(), ''admin''))', t);
  end loop; end $$;

create policy "media admin read" on storage.objects for select to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.has_role(auth.uid(),'admin'));