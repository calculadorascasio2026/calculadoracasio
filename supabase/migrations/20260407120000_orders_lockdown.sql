-- Pedidos: sin listado público; lectura por id vía RPC
drop policy if exists orders_select_public on public.orders;

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select
  on public.orders for select
  to authenticated
  using (public.current_user_is_admin());

create or replace function public.get_public_order(p_id uuid)
returns table (
  id uuid,
  items jsonb,
  total numeric,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select o.id, o.items, o.total, o.status, o.created_at
  from public.orders o
  where o.id = p_id;
$$;

revoke all on function public.get_public_order(uuid) from public;
grant execute on function public.get_public_order(uuid) to anon, authenticated;

revoke select on table public.orders from anon;
grant select on table public.orders to authenticated;
