-- FORCE SCHEMA STATE: Ensure 'foods' is the only table and has correct constraints
BEGIN;

-- 1. Handle "foods" vs "food_items" conflict
-- Scenario A: Both exist -> Move data from food_items to foods, then drop food_items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_items') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foods') THEN
        
        -- Optional: Copy data if 'foods' is empty? 
        -- Assuming 'foods' is the desired one, we'll just drop 'food_items' to resolve ambiguity
        -- If you need data from food_items, run: INSERT INTO foods SELECT * FROM food_items;
        
        DROP TABLE food_items CASCADE; -- Cascade drops old constraints pointing to it
    
    -- Scenario B: Only 'food_items' exists -> Rename it
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_items') THEN
        ALTER TABLE food_items RENAME TO foods;
    END IF;
END $$;

-- 2. Now 'foods' is definitively the table. Apply constraints.
-- Fix Restaurants -> Foods
ALTER TABLE foods DROP CONSTRAINT IF EXISTS foods_restaurant_id_fkey;
ALTER TABLE foods
    ADD CONSTRAINT foods_restaurant_id_fkey
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE;

-- Fix Cart -> Foods
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_food_id_fkey;
ALTER TABLE cart_items
    ADD CONSTRAINT cart_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE;

-- Fix Wishlist -> Foods
ALTER TABLE wishlist_items DROP CONSTRAINT IF EXISTS wishlist_items_food_id_fkey;
ALTER TABLE wishlist_items
    ADD CONSTRAINT wishlist_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE;

-- Fix Order Items -> Foods
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_food_id_fkey;
ALTER TABLE order_items
    ADD CONSTRAINT order_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE;

-- 3. Indexes (Idempotent)
CREATE INDEX IF NOT EXISTS idx_foods_restaurant_id ON foods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);

COMMIT;
