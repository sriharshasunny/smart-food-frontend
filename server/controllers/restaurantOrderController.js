const supabase = require('../utils/supabase');

// 1. Get all orders for a specific restaurant
exports.getRestaurantOrders = async (req, res) => {
    try {
        const { id } = req.params; // restaurant_id

        // Fetch order items for this restaurant, joining with the main order info
        const { data: items, error } = await supabase
            .from('order_items')
            .select(`
                *,
                order:orders!inner(*)
            `)
            .eq('restaurant_id', id)
            .order('created_at', { foreignTable: 'orders', ascending: false });

        if (error) throw error;

        // Group items by order_id for better display in the dashboard
        const orderMap = {};
        items.forEach(item => {
            const oid = item.order_id;
            if (!orderMap[oid]) {
                orderMap[oid] = {
                    id: oid,
                    ...item.order,
                    items: []
                };
            }
            orderMap[oid].items.push({
                itemId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                status: item.preparation_status,
                image: item.image
            });
        });

        res.json(Object.values(orderMap));
    } catch (error) {
        console.error("Get Restaurant Orders Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Update preparation status of a specific item
exports.updateOrderItemStatus = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status } = req.body; // 'Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'

        const { data, error } = await supabase
            .from('order_items')
            .update({ preparation_status: status })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;

        // Optional: If all items in an order are 'Delivered', update the main order status
        // But for now, we focus on the restaurant's view.

        res.json({ message: "Status updated", item: data });
    } catch (error) {
        console.error("Update Item Status Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
