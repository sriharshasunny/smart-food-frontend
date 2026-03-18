const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class OrderService {
    /**
     * Fetch user's recent order history
     */
    async getUserOrders(userId, limit = 5) {
        if (!userId) return [];
        try {
            const { data: orders, error } = await supabase
                .from('orders')
                .select(`
                    id,
                    total_amount,
                    status,
                    created_at,
                    order_items (
                        quantity,
                        price_at_time,
                        food:food_id (id, name, price, is_veg, restaurant:restaurant_id(id, name, address, rating))
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error("Supabase Order Fetch Error:", error);
                return [];
            }
            
            return orders.map(o => ({
                id: o.id,
                total_amount: o.total_amount,
                status: o.status,
                created_at: o.created_at,
                items: o.order_items || []
            }));

        } catch (error) {
            console.error("OrderService.getUserOrders Error:", error);
            return [];
        }
    }
}

module.exports = new OrderService();
