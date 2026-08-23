-- Crear pedido sin SELECT directo en orders (anon no tiene select tras lockdown)
create or replace function public.create_public_order(p_items jsonb, p_total numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'items invalidos';
  end if;
  if p_total is null or p_total < 0 then
    raise exception 'total invalido';
  end if;

  insert into public.orders (items, total, status)
  values (p_items, p_total, 'pending')
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.create_public_order(jsonb, numeric) from public;
grant execute on function public.create_public_order(jsonb, numeric) to anon, authenticated;
