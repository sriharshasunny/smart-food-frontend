-- Migration: Fix Foreign Key Constraints for Cart and Wishlist
-- Reason: cart_items was referencing 'food_items' (legacy/missing), but active data is in 'foods'.

BEGIN;

-- 1. Scan for invalid references before altering (Optional cleanup)
-- DELETE FROM cart_items WHERE food_id NOT IN (SELECT id FROM foods);
-- DELETE FROM wishlist_items WHERE food_id NOT IN (SELECT id FROM foods);

-- 2. Drop existing malformed constraints
ALTER TABLE cart_items 
  DROP CONSTRAINT IF EXISTS cart_items_food_id_fkey;

ALTER TABLE wishlist_items 
  DROP CONSTRAINT IF EXISTS wishlist_items_food_id_fkey;

-- 3. Add correct constraints referencing 'foods'
ALTER TABLE cart_items 
  ADD CONSTRAINT cart_items_food_id_fkey 
  FOREIGN KEY (food_id) 
  REFERENCES foods(id) 
  ON DELETE CASCADE;

ALTER TABLE wishlist_items 
  ADD CONSTRAINT wishlist_items_food_id_fkey 
  FOREIGN KEY (food_id) 
  REFERENCES foods(id) 
  ON DELETE CASCADE;

COMMIT;
