const supabase = require('../utils/supabase');
/**
 * Candidate Engine: Responsible for generating an initial broad pool of 
 * candidate foods before filtering and ranking.
 */
class CandidateEngine {
    
    /**
     * Get a mixed pool of candidates based on user preferences and location.
     * Caches roughly 200 items.
     */
    async getPersonalizedCandidates(userId, location = null, limit = 200) {
        let query = supabase.from('foods').select('*, restaurant:restaurant_id(*)').eq('available', true);
        
        try {
            // Fetch User Tastes
            const { data: pref } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();
            
            if (pref) {
                // Determine top 3 cuisines
                const cuisines = pref.category_scores ? Object.entries(pref.category_scores)
                    .sort(([, a], [, b]) => b - a).slice(0, 3).map(([c]) => c) : [];
                
                if (cuisines.length > 0) {
                    query = query.in('category', cuisines);
                }

                // Hard fallback to highly rated to pad the query pool
                query = query.order('rating', { ascending: false });
            }

            const { data, error } = await query.limit(limit);
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("[CandidateEngine] getPersonalizedCandidates Error:", error);
            return [];
        }
    }

    /**
     * Get pure trending candidates across the entire app.
     */
    async getTrendingCandidates(limit = 50) {
        try {
            const { data, error } = await supabase
                .from('foods')
                .select('*, restaurant:restaurant_id(*)')
                .eq('available', true)
                .order('rating', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("[CandidateEngine] getTrendingCandidates Error:", error);
            return [];
        }
    }

    /**
     * Gets similar foods by finding the category/cuisine of the target food.
     */
    async getSimilarCandidates(foodId, limit = 20) {
        try {
            const { data: target } = await supabase.from('foods').select('*').eq('id', foodId).single();
            if (!target) return [];

            const { data, error } = await supabase
                .from('foods')
                .select('*, restaurant:restaurant_id(*)')
                .eq('available', true)
                .eq('category', target.category)
                .neq('id', foodId)
                .order('rating', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("[CandidateEngine] getSimilarCandidates Error:", error);
            return [];
        }
    }
}

module.exports = new CandidateEngine();
