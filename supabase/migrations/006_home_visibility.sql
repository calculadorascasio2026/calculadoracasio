-- Mostrar/ocultar destacados y ofertas en la home
alter table public.hero_promo
  add column if not exists show_featured_on_home boolean not null default true,
  add column if not exists show_offers_on_home boolean not null default true;

update public.hero_promo
set show_offers_on_home = coalesce(visible, true)
where id = 1;

comment on column public.hero_promo.show_featured_on_home is 'Mostrar carrusel destacados en home';
comment on column public.hero_promo.show_offers_on_home is 'Mostrar badge ofertas en home';
