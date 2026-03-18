const supabase = require('../utils/supabase');
const behaviorEngine = require('./behaviorEngine');
const similarityEngine = require('./similarityEngine');
const diversityEngine = require('./diversityEngine');
const rankingEngine = require('./rankingEngine');
const queryService = require('../database/queryService');
const { createClient } = require('@supabase/supabase-js');

/**
 * Orchestrates all recommendation logical steps:
 * 1. Fetch raw candidates
 * 2. Fetch User Profile
 * 3. Rank via Preferences
 * 4. Deduplicate actively shown items
 * 5. Ensure 70/30 Diversity mix.
 */
class RecommendationEngine {
    
    /**
     * Get tailored recommendations for a user.
     */
    async getRecommendations(userId, limit = 10, filters = {}) {
        try {
            // 1. Fetch User Profile & Preferences
            const userProfile = await behaviorEngine.getUserProfile(userId);

            // 2. Fetch base foods (Trending + New)
            // Filter by active restaurants
            let query = supabase.from('foods').select('*, restaurant:restaurants!inner(*)')
                .eq('available', true)
                .eq('restaurant.is_active', true);

            // Fetch an initial large pool to rank and filter down (e.g. 50 items)
            const { data: rawCandidates, error } = await query.limit(50);
            if (error || !rawCandidates) return [];

            // 3. Score and Rank candidates against user preferences
            const rankedCandidates = rankingEngine.rankFoods(rawCandidates, userProfile, {
                maxPrice: filters.price_max
            });

            // 4. Extract recently seen history to deduplicate
            const sessionHistoryIds = await this.getRecentRecommendations(userId);
            
            // 5. Similarity Deduplication (returns clean array and seen set)
            // We pass top 20 for deductions
            const { deduped } = await similarityEngine.deduplicate(rankedCandidates.slice(0, 20), sessionHistoryIds);

            // 6. Enforce Diversity (70% preferred base, 30% exploration/trending)
            // Deduped represents personalized high-scoring. Let's slice out true trending from raw.
            const genericTrending = rawCandidates.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 15);
            
            let finalRecommendations = diversityEngine.enforceDiversity(deduped, genericTrending, limit);

            // 6. Check required count. If < 10, fallback to queryService and merge
            if (finalRecommendations.length < 10) {
                console.log(`[RecommendationEngine] Shortfall detected (${finalRecommendations.length} results). Firing fallback queryService.`);
                const remaining = 10 - finalRecommendations.length;
                const dbFallbacks = await queryService.matchUserTaste(userId, filters, remaining);
                
                // Merge preventing duplicates
                const currentIds = new Set(finalRecommendations.map(f => f.id));
                const addedFallbacks = dbFallbacks.filter(f => {
                    if(!currentIds.has(f.id)) {
                        f.score = 5.0; // static base score
                        f.source = 'fallback_query';
                        return true;
                    }
                    return false;
                });
                
                finalRecommendations = [...finalRecommendations, ...addedFallbacks];

                // Re-sort just to be safe
                finalRecommendations.sort((a, b) => (b.score || 0) - (a.score || 0));
            }

            // 7. Update recommendation history cache
            const historyInserts = finalRecommendations.map(food => ({
                user_id: userId,
                food_id: food.id,
                created_at: new Date()
            }));
            
            if (historyInserts.length > 0) {
                // Background fire and forget
                supabase.from('recommendation_history').insert(historyInserts).then(() => {});
            }

            return finalRecommendations.slice(0, 10);

        } catch (error) {
            console.error('[RecommendationEngine] Failed:', error.message);
            return [];
        }
    }

    /**
     * Retrieves recent foods the user was shown to avoid repetition.
     */
    async getRecentRecommendations(userId) {
        if (!userId) return [];
        try {
            const { data } = await supabase.from('recommendation_history')
                .select('food_id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20);
            return (data || []).map(r => r.food_id);
        } catch(e) {
            return [];
        }
    }
}

module.exports = new RecommendationEngine();
