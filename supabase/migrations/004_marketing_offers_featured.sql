-- Ofertas y productos destacados (marketing / QR)
create table if not exists public.product_offers (
  product_id uuid primary key references public.products (id) on delete cascade,
  discount_percent numeric(5, 2) not null check (discount_percent > 0 and discount_percent <= 100),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.featured_products (
  product_id uuid primary key references public.products (id) on delete cascade,
  sort_order int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.product_offers enable row level security;
alter table public.featured_products enable row level security;

drop policy if exists product_offers_select_public on public.product_offers;
create policy product_offers_select_public
  on public.product_offers for select
  to anon, authenticated
  using (active = true);

drop policy if exists product_offers_admin_all on public.product_offers;
create policy product_offers_admin_all
  on public.product_offers for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists featured_products_select_public on public.featured_products;
create policy featured_products_select_public
  on public.featured_products for select
  to anon, authenticated
  using (active = true);

drop policy if exists featured_products_admin_all on public.featured_products;
create policy featured_products_admin_all
  on public.featured_products for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

grant select on table public.product_offers to anon, authenticated;
grant all on table public.product_offers to authenticated;
grant select on table public.featured_products to anon, authenticated;
grant all on table public.featured_products to authenticated;
