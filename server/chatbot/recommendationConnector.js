const supabase = require('../utils/supabase');

/**
 * Connects intent and entities to actual database queries and recommendation logic.
 */
class RecommendationConnector {
    async advancedSearchFood(filters) {
        let query = supabase.from('foods').select('*, restaurant:restaurants!inner(*)');
        query = query.eq('restaurant.is_active', true).eq('available', true);

        if (filters.food_name) {
            const words = filters.food_name.split(',').map(w => w.replace(/[^a-zA-Z0-9 ]/g, '').trim()).filter(Boolean);
            const orConditions = words.flatMap(w => [
                `name.ilike.%${w}%`, `category.ilike.%${w}%`, `description.ilike.%${w}%`
            ]);
            if (orConditions.length) query = query.or(orConditions.join(','));
        }

        if (filters.price_max) query = query.lte('price', filters.price_max);
        if (typeof filters.veg === 'boolean') query = query.eq('is_veg', filters.veg);

        let { data, error } = await query
            .order('rating', { ascending: false, nullsLast: true })
            .limit(Math.min(filters.limit || 10, 20));

        if (error && error.message?.includes('rating')) {
            ({ data, error } = await query.order('created_at', { ascending: false }).limit(Math.min(filters.limit || 10, 20)));
        }

        if (error) {
            console.error('[RecommendationConnector] Search food error:', error.message);
            return [];
        }
        return data || [];
    }

    async getTrendingItems(filters = {}) {
        const limit = filters.limit || 6;
        let { data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
            .eq('available', true)
            .eq('restaurant.is_active', true)
            .order('rating', { ascending: false, nullsLast: true })
            .limit(limit);

        if (error && error.message?.includes('rating')) {
            ({ data, error } = await supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
                .eq('available', true)
                .eq('restaurant.is_active', true)
                .order('created_at', { ascending: false }).limit(limit));
        }
        return data || [];
    }

    async getRestaurants(filters = {}) {
        const limit = filters.limit || 6;
        let query = supabase.from('restaurants').select('*, foods(*)').eq('is_active', true);
        if (filters.restaurant_name) query = query.ilike('name', `%${filters.restaurant_name}%`);
        if (filters.location) query = query.ilike('address', `%${filters.location}%`);

        const { data, error } = await query.order('rating', { ascending: false, nullsLast: true }).limit(limit);
        if (error) return [];

        (data || []).forEach(r => {
            if (Array.isArray(r.foods)) {
                r.foods = r.foods.filter(f => f.available !== false).slice(0, 10);
            }
        });
        return data || [];
    }

    async getOrderHistory(userId) {
        if (!userId) return [];
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*, food:foods(*, restaurant:restaurants(*)))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('[RecommendationConnector] Orders error:', error);
            return [];
        }
        return orders || [];
    }
}

module.exports = new RecommendationConnector();
