-- PRESERVE ORDER HISTORY MIGRATION
-- Changes ON DELETE CASCADE to ON DELETE SET NULL for order items
-- This ensure past orders are not deleted when a food is removed from the menu.

BEGIN;

-- 1. Modify the foreign key on order_items to use SET NULL instead of CASCADE
ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS order_items_food_id_fkey;

ALTER TABLE order_items
    ADD CONSTRAINT order_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE SET NULL;

-- 2. Ensure food_id is nullable (it should be, but just to be sure)
ALTER TABLE order_items ALTER COLUMN food_id DROP NOT NULL;

COMMIT;
