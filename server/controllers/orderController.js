const supabase = require('../utils/supabase');
const emailService = require('../utils/emailService');

// 1. Verify/Confirm Order (Post-Payment)
exports.verifyOrder = async (req, res) => {
    try {
        const { orderId, paymentId } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // Fetch Order
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Idempotency Check: If already confirmed, return success immediately
        // This prevents double emails if both Mobile (redirect) and Laptop (polling) verify it.
        if (order.order_status === 'Confirmed' || order.payment_status === 'Completed') {
            console.log(`[Order] Order ${orderId} already verified. Skipping duplicate processing.`);
            return res.status(200).json({ message: "Order already verified", order: order });
        }

        // Auto-Link Logic: If order has no userId, try to link via email
        let finalUserId = order.user_id;

        // Check if guest info exists and has email
        // Note: Supabase stores JSONB as object, so access directly
        const guestEmail = order.guest_info?.email;

        if (!finalUserId && guestEmail) {
            const { data: linkedUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', guestEmail)
                .single();

            if (linkedUser) {
                console.log(`[Order] Auto-linking orphan order ${orderId} to user ${linkedUser.id}`);
                finalUserId = linkedUser.id;
            }
        }

        // Update status
        const updatePayload = {
            payment_status: 'Completed',
            order_status: 'Confirmed',
            user_id: finalUserId // Update if linked
        };
        if (paymentId) updatePayload.payment_id = paymentId;

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId)
            .select()
            .single();

        if (updateError) throw updateError;

        console.log(`[Order] Verified Order ${orderId}`);

        // Send Email (Adapt to snake_case if needed or map before sending)
        if (guestEmail) {
            // Map back to camelCase for email template compatibility if needed
            // Or ensure emailService handles both. Assuming emailService expects objects.
            // Let's provide a compatible object
            const orderForEmail = {
                ...updatedOrder,
                _id: updatedOrder.id, // Map id to _id for email template
                guestInfo: updatedOrder.guest_info,
                totalAmount: updatedOrder.total_amount,
                invoiceLink: `${process.env.CLIENT_URL || 'http://localhost:5173'}/orders/${updatedOrder.id}/invoice`,
                items: [] // fetch items if needed for email, but verifyOrder usually just confirms
            };
            // Fetch items for email if essential
            const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
            orderForEmail.items = items || [];

            console.log(`[Order] Sending confirmation email to: ${guestEmail}`);
            console.log(`[Order] Email Payload Items Count: ${orderForEmail.items.length}`);

            emailService.sendOrderConfirmation(guestEmail, orderForEmail)
                .then(() => console.log(`[Order] Email sent successfully to ${guestEmail}`))
                .catch(err => console.error("[Order] Background Email Error:", err));
        } else {
            console.warn("[Order] No guest email found for order", orderId);
        }

        res.status(200).json({ message: "Order verified", order: updatedOrder });

    } catch (error) {
        console.error("Verify Order Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2b. Get Single Order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items ( * )
            `)
            .eq('id', id)
            .single();

        if (error || !order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);
    } catch (error) {
        console.error("Get Order Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Get Order History
exports.getOrderHistory = async (req, res) => {
    try {
        const queryUserId = req.query.userId || req.user?.userId;

        if (!queryUserId) {
            return res.status(400).json({ message: "User ID required" });
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items ( * )
            `)
            .eq('user_id', queryUserId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map for frontend compatibility (camelCase)
        const formattedOrders = orders.map(o => ({
            _id: o.id,
            totalAmount: o.total_amount,
            orderStatus: o.order_status,
            paymentStatus: o.payment_status,
            createdAt: o.created_at,
            items: o.order_items,
            guestInfo: o.guest_info,
            currency: o.currency
        }));

        res.json(formattedOrders);

    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. Delete Order History
exports.deleteOrderHistory = async (req, res) => {
    try {
        const queryUserId = req.query.userId || req.body.userId;
        if (!queryUserId) {
            return res.status(400).json({ message: "User ID required" });
        }

        // Supabase Cascade Delete should handle order_items if configured, 
        // but explicit delete is safer if cascade isn't verified. 
        // Our schema said 'on delete cascade' for items, so deleting orders is enough.

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('user_id', queryUserId);

        if (error) throw error;

        res.json({ message: "Order history cleared successfully" });

    } catch (error) {
        console.error("Delete History Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
