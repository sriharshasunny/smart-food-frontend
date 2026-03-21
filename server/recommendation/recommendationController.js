const candidateEngine = require('./candidateEngine');
const rankingEngine = require('./rankingEngine');
const diversityEngine = require('./diversityEngine');
const behaviorEngine = require('./behaviorEngine');
const similarityEngine = require('./similarityEngine');
const supabase = require('../utils/supabase');
/**
 * Executes a full recommendation pipeline run.
 */
async function processPipeline(userId, candidates, requestedLimit) {
    if (!candidates || candidates.length === 0) return [];

    // 1. Get recent history to deduplicate
    let recentIds = new Set();
    if (userId) {
        const { data: history } = await supabase
            .from('recommendation_history')
            .select('food_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(30);
        if (history) {
            recentIds = new Set(history.map(h => h.food_id));
        }
    }

    // 2. Score Candidates
    const scored = await rankingEngine.scoreFoods(userId, candidates, {});

    // 3. Filter Deduplications securely
    const deduped = scored.filter(f => !recentIds.has(f.id));

    // 4. Force 70/30 Diversity Split 
    // Separates Top trending from Personalized deduplicated
    const trending = scored.sort((a,b) => b.rating - a.rating).slice(0, 30);
    const finalMix = diversityEngine.enforceDiversity(deduped, trending, requestedLimit);

    // 5. Asynchronously dump recommended items back to history
    if (userId && finalMix.length > 0) {
        const historyInserts = finalMix.map(food => ({
            user_id: userId,
            food_id: food.id,
            created_at: new Date()
        }));
        supabase.from('recommendation_history').insert(historyInserts).then(() => {});
    }

    return finalMix;
}

exports.getPersonalizedRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const candidates = await candidateEngine.getPersonalizedCandidates(userId, null, 200);
        const finalMix = await processPipeline(userId, candidates, limit);

        res.json(finalMix);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getLocationAwareRecommendations = async (req, res) => {
    try {
        const { userId, location } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const candidates = await candidateEngine.getPersonalizedCandidates(userId, location, 200);
        const finalMix = await processPipeline(userId, candidates, limit);

        res.json(finalMix);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const candidates = await candidateEngine.getTrendingCandidates(limit);
        res.json(candidates);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getSimilarFoods = async (req, res) => {
    try {
        const { foodId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const similar = await candidateEngine.getSimilarCandidates(foodId, limit);
        res.json(similar);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getExploreSelection = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        // Explores completely orthogonal stuff (trending fallback only)
        const candidates = await candidateEngine.getTrendingCandidates(100);
        const finalMix = await processPipeline(userId, candidates, limit);
        res.json(finalMix);
    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.trackUserActivity = async (req, res) => {
    try {
        const { userId, foodId, actionType, location } = req.body;
        if (!userId || !foodId || !actionType) return res.status(400).json({ error: "Missing required tracking data." });
        
        await behaviorEngine.trackAction(userId, foodId, actionType, { location });
        res.json({ success: true });
    } catch (error) {
        console.error("Controller Error Track Activity:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
