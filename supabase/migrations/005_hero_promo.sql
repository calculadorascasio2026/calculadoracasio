-- Textos y % del badge de oferta del hero
create table if not exists public.hero_promo (
  id int primary key default 1 check (id = 1),
  badge_text text not null default '10% OFF',
  title text not null default 'Oferta en compras',
  subtitle text not null default 'en productos seleccionados',
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.hero_promo (id, badge_text, title, subtitle, visible)
values (1, '10% OFF', 'Oferta en compras', 'en productos seleccionados', true)
on conflict (id) do nothing;

alter table public.hero_promo enable row level security;

drop policy if exists hero_promo_select_public on public.hero_promo;
create policy hero_promo_select_public
  on public.hero_promo for select
  to anon, authenticated
  using (true);

drop policy if exists hero_promo_admin_all on public.hero_promo;
create policy hero_promo_admin_all
  on public.hero_promo for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

grant select on table public.hero_promo to anon, authenticated;
grant all on table public.hero_promo to authenticated;
