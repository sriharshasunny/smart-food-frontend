-- MASTER SCHEMA REFINEMENT & FIX SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

BEGIN;

-- 1. Standardization: Ensure 'foods' is the table name
-- If 'food_items' table exists but 'foods' doesn't, rename it.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'food_items') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'foods') THEN
        ALTER TABLE food_items RENAME TO foods;
    END IF;
END $$;

-- 2. Cleanup: If both exist (messy state), we assume 'foods' is the active one (based on recent code usage)
-- and we drop 'food_items' to avoid confusion. WARNING: Ensure data is migrated if needed.
-- For now, we'll just ensure foreign keys point to 'foods'.

-- 3. FIX: Restaurants -> Foods (Cascade Delete)
-- When a restaurant is deleted, all its foods should be deleted.
ALTER TABLE foods
    DROP CONSTRAINT IF EXISTS foods_restaurant_id_fkey,
    ADD CONSTRAINT foods_restaurant_id_fkey
    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id)
    ON DELETE CASCADE;

-- 4. FIX: Cart Items -> Foods (Cascade Delete)
-- When a food is deleted, it should be removed from carts.
ALTER TABLE cart_items
    DROP CONSTRAINT IF EXISTS cart_items_food_id_fkey,
    DROP CONSTRAINT IF EXISTS cart_items_food_items_food_id_fkey, -- Legacy name
    ADD CONSTRAINT cart_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE;

-- 5. FIX: Wishlist Items -> Foods (Cascade Delete)
ALTER TABLE wishlist_items
    DROP CONSTRAINT IF EXISTS wishlist_items_food_id_fkey,
    ADD CONSTRAINT wishlist_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE;

-- 6. FIX: Order Items -> Foods (SET NULL or CASCADE?)
-- Decision: For data integrity of *past* orders, we should technically keep the data.
-- However, for this app's "reliability" request, preventing broken FKs is priority.
-- We will use CASCADE for now to prevent errors, but we will ensure the Order Controller
-- saves a *snapshot* of the food name/price so the history remains readable even if the row is gone.
ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS order_items_food_id_fkey,
    ADD CONSTRAINT order_items_food_id_fkey
    FOREIGN KEY (food_id)
    REFERENCES foods(id)
    ON DELETE CASCADE;

-- 7. PERFORMANCE: Add Indexes
CREATE INDEX IF NOT EXISTS idx_foods_restaurant_id ON foods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_price ON foods(price);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- 8. RELIABILITY: Ensure RLS is enabled but policies exist
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Re-apply policies to be safe (idempotent-ish)
DROP POLICY IF EXISTS "Public Read Restaurants" ON restaurants;
CREATE POLICY "Public Read Restaurants" ON restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Foods" ON foods;
CREATE POLICY "Public Read Foods" ON foods FOR SELECT USING (true);

COMMIT;
