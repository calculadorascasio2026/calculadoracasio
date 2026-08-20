-- Stock visible en tienda (sin stock / con stock)
alter table public.products
  add column if not exists in_stock boolean not null default true;

comment on column public.products.in_stock is 'false = mostrar Sin stock en la tienda';
