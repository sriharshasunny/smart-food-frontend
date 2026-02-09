-- Migration: Add Indexes for Performance
-- Reason: Missing indexes on FKs and common filter columns cause slow sequential scans.

BEGIN;

-- 1. Index for Food -> Restaurant lookups (Critical for Menu page)
CREATE INDEX IF NOT EXISTS idx_foods_restaurant_id ON foods(restaurant_id);

-- 2. Index for Category filtering (Future proofing)
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);

-- 3. Index for Top Rated Restaurants (Home page sorting)
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

-- 4. Index for Active Restaurants (Home page filtering)
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);

COMMIT;
