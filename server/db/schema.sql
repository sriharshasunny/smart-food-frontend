
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create 'restaurants' table
create table if not exists restaurants (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text unique not null,
  password text not null,
  address text,
  cuisine text,
  rating numeric default 0,
  image text,
  is_active boolean default true
);

-- 3. Create 'foods' table with Foreign Key
create table if not exists foods (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  description text,
  category text,
  image text,
  is_veg boolean default true,
  available boolean default true
);

-- 4. Enable RLS (Row Level Security) - Best Practice for Supabase
alter table restaurants enable row level security;
alter table foods enable row level security;

-- 5. Create Policies (Allow Public Read/Write for this demo)
-- Note: In production, you'd want stricter policies.
create policy "Enable read access for all users" on restaurants for select using (true);
create policy "Enable insert access for all users" on restaurants for insert with check (true);
create policy "Enable update access for all users" on restaurants for update using (true);

create policy "Enable read access for all users" on foods for select using (true);
create policy "Enable insert access for all users" on foods for insert with check (true);
create policy "Enable update access for all users" on foods for update using (true);
create policy "Enable delete access for all users" on foods for delete using (true);

-- 6. Add missing columns (Idempotent checks)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'restaurants' and column_name = 'is_active') then 
    alter table restaurants add column is_active boolean default true; 
  end if; 

  if not exists (select 1 from information_schema.columns where table_name = 'restaurants' and column_name = 'email') then 
    alter table restaurants add column email text unique; 
  end if;
end $$;

-- 7. Create Cart and Wishlist Tables (if not exist)
create table if not exists cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null, -- Assuming Supabase Auth
  food_id uuid references foods(id) on delete cascade not null, -- Corrected FK to foods
  quantity integer default 1,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  food_id uuid references foods(id) on delete cascade not null, -- Corrected FK to foods
  added_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Add Performance Indexes
CREATE INDEX IF NOT EXISTS idx_foods_restaurant_id ON foods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);

-- 9. Force Schema Cache Refresh
notify pgrst, 'reload schema';
