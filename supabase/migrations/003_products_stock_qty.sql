-- Cantidad de stock (menor a 1 = sin stock)
alter table public.products
  add column if not exists stock integer not null default 0;

update public.products
set stock = case when coalesce(in_stock, true) then greatest(stock, 1) else 0 end;

comment on column public.products.stock is 'Cantidad en stock; menor a 1 = sin stock en tienda';
