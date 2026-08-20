-- Viñolo Casio — esquema mínimo (productos + categorías planas)

create extension if not exists "pgcrypto";

create table public.admin_users (
  email text primary key
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  image_path text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on public.products (category_id);
create index idx_products_active on public.products (active);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where lower(btrim(au.email)) =
          lower(btrim(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy admin_users_self_select
  on public.admin_users for select
  to authenticated
  using (lower(btrim(email)) = lower(btrim(coalesce(auth.jwt() ->> 'email', ''))));

create policy categories_select_public
  on public.categories for select
  to anon, authenticated
  using (true);

create policy categories_admin_all
  on public.categories for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

create policy products_select_public_active
  on public.products for select
  to anon, authenticated
  using (active = true);

create policy products_admin_all
  on public.products for all
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

grant usage on schema public to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant all on table public.categories to authenticated;
grant all on table public.products to authenticated;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "Admin insert product images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and public.current_user_is_admin()
  );

create policy "Admin update product images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.current_user_is_admin()
  );

create policy "Admin delete product images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and public.current_user_is_admin()
  );

insert into public.categories (name, slug, sort_order) values
  ('Científicas', 'cientificas', 1),
  ('Básicas', 'basicas', 2),
  ('Gráficas', 'graficas', 3)
on conflict (slug) do nothing;

-- insert into public.admin_users (email) values ('admin@ejemplo.com');
