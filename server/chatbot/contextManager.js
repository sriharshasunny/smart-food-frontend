const supabase = require('../utils/supabase');

/**
 * Manages conversation context and user memory state.
 */
class ContextManager {
    /**
     * Retrieves the last N messages from chat history to build conversation memory.
     */
    async getRecentHistory(userId, limit = 10) {
        if (!userId) return [];
        try {
            const { data, error } = await supabase
                .from('chat_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            // Return chronological order
            return data.reverse();
        } catch (error) {
            console.error('[ContextManager] Error getting history:', error.message);
            return [];
        }
    }

    /**
     * Builds a stringified context of recent history for Gemini prompting.
     */
    buildContextString(history) {
        if (!history || history.length === 0) return '';
        return history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    }

    /**
     * Asynchronously saves a message to the database.
     */
    async saveMessage(userId, role, content, meta = {}) {
        if (!userId || !content) return;
        try {
            await supabase.from('chat_history').insert({
                user_id: userId,
                role,
                content,
                created_at: new Date().toISOString()
            }); // we could store meta in a jsonb column if DB is updated
        } catch (error) {
            console.error('[ContextManager] Error saving message:', error.message);
        }
    }

    /**
     * Synthesizes ongoing conversation filters (e.g., merging previous intent filters with new ones)
     */
    mergeContextFilters(previousFilters = {}, newFilters = {}) {
        // e.g., Combine past price limit with new veg requirement
        return {
            ...previousFilters,
            ...newFilters
        };
    }
}

module.exports = new ContextManager();
