-- Migration: Fix Delete Cascade for Orders and Order Items
-- Reason: Deleting a restaurant fails because 'order_items' references 'foods' without CASCADE.
-- When a restaurant is deleted -> foods are deleted (CASCADE) -> check order_items (FAIL).
alter table order_items
drop constraint if exists order_items_food_id_fkey,
add constraint order_items_food_id_fkey
    foreign key (food_id)
    references foods(id)
    on delete cascade;

-- Also ensure 'cart_items' has cascade (just in case, though schema.sql said it did)
alter table cart_items
drop constraint if exists cart_items_food_id_fkey,
add constraint cart_items_food_id_fkey
    foreign key (food_id)
    references foods(id)
    on delete cascade;

-- Optional: If orders reference restaurants directly (not seen in code, but good practice)
-- If there is a 'restaurant_id' on 'orders' table:
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'restaurant_id') then
    alter table orders
    drop constraint if exists orders_restaurant_id_fkey,
    add constraint orders_restaurant_id_fkey
        foreign key (restaurant_id)
        references restaurants(id)
        on delete cascade;
  end if;
end $$;
