const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class QueryService {
    /**
     * Fallback database query: fetches highly rated foods matching the user's top cuisines or price.
     */
    async matchUserTaste(userId, filters = {}, limit = 10) {
        try {
            // 1. Fetch user's top preferences to guide the fallback
            const { data: prefData } = await supabase
                .from('user_preferences')
                .select('category_scores, veg_score')
                .eq('user_id', userId)
                .single();

            let query = supabase.from('foods').select('*, restaurant:restaurant_id(id, name, address, rating)');
            query = query.eq('available', true);

            // Apply strict filters if provided by Chatbot (e.g. "Suggest veg biryani under 300")
            if (filters.foodType && filters.foodType.toLowerCase() === 'veg') {
                query = query.eq('is_veg', true);
            } else if (filters.foodType && filters.foodType.toLowerCase() === 'non-veg') {
                query = query.eq('is_veg', false);
            } else if (prefData?.veg_score > 5) {
                // Heavily prefers veg
                query = query.eq('is_veg', true);
            }

            if (filters.budget) {
                query = query.lte('price', filters.budget);
            }

            if (filters.foodItem) {
                query = query.ilike('name', `%${filters.foodItem}%`);
            } else if (prefData?.category_scores) {
                // If no strict food item filtered, sort by their favorite cuisines
                const topCuisines = Object.entries(prefData.category_scores)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([cuisine]) => cuisine);
                if (topCuisines.length > 0) {
                    // Match any of top 3 cuisines
                    query = query.in('category', topCuisines);
                }
            }

            // High rating fallback preference
            query = query.order('rating', { ascending: false });
            query = query.limit(limit);

            const { data: fallbackFoods, error } = await query;
            if (error) throw error;
            
            return fallbackFoods || [];

        } catch (error) {
            console.error("QueryService.matchUserTaste Error:", error);
            // Absolute generic fallback if preference extraction fails
            const { data } = await supabase.from('foods').select('*, restaurant:restaurant_id(id, name, address, rating)').eq('available', true).order('rating', { ascending: false }).limit(limit);
            return data || [];
        }
    }

    /**
     * Direct database broad text search
     */
    async searchFood(queryText, limit = 10) {
        try {
             // In Supabase, if using ilike or textSearch
             const { data } = await supabase
                .from('foods')
                .select('*, restaurant:restaurant_id(id, name, address, rating)')
                .eq('available', true)
                .ilike('name', `%${queryText}%`)
                .order('rating', { ascending: false })
                .limit(limit);
             return data || [];
        } catch (e) {
            console.error("QueryService.searchFood Error:", e);
            return [];
        }
    }
}

module.exports = new QueryService();
