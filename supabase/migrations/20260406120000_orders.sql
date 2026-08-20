-- Pedidos / carritos compartidos (consulta por WhatsApp)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null default '[]'::jsonb,
  total numeric(12, 2) not null default 0 check (total >= 0),
  status text not null default 'pending' check (status in ('pending', 'seen', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists orders_insert_public on public.orders;
create policy orders_insert_public
  on public.orders for insert
  to anon, authenticated
  with check (true);

drop policy if exists orders_select_public on public.orders;
create policy orders_select_public
  on public.orders for select
  to anon, authenticated
  using (true);

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update
  on public.orders for update
  to authenticated
  using (public.current_user_is_admin())
  with check (public.current_user_is_admin());

drop policy if exists orders_admin_delete on public.orders;
create policy orders_admin_delete
  on public.orders for delete
  to authenticated
  using (public.current_user_is_admin());

grant select, insert on table public.orders to anon, authenticated;
grant update, delete on table public.orders to authenticated;
