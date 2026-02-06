const DodoPayments = require('dodopayments');
const dotenv = require('dotenv');
const path = require('path');
const supabase = require('../utils/supabase');
const crypto = require('crypto'); // For UUID generation

dotenv.config({ path: path.join(__dirname, '../../.env') });

const client = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: 'test_mode', // Default to test mode
});

exports.createPayment = async (req, res) => {
    try {
        const { amount, currency = 'INR', user, cart } = req.body;
        console.log('Received Payment Request:', { amount, user, cartLength: cart?.length });

        if (!amount) {
            return res.status(400).json({ message: 'Amount is required' });
        }

        // 1. Create a Product for this transaction (Dynamic Price)
        const product = await client.products.create({
            name: `Food Order #${Date.now()}`,
            description: 'Delicious food from SmartFood Delivery',
            tax_category: 'digital_products',
            price: {
                type: 'one_time_price',
                price: Math.round(amount * 100),
                currency: currency,
                pay_what_you_want: false,
                purchasing_power_parity: false,
                discount: 0
            }
        });

        console.log(`Product created: ${product.product_id}`);

        // 2. Generate Order ID (UUID for Supabase)
        const newOrderId = crypto.randomUUID();

        // 3. Create Checkout Session
        // Ensure CLIENT_URL is valid (Add https if missing, remove trailing slash)
        let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        if (!clientUrl.startsWith('http')) clientUrl = `https://${clientUrl}`;
        if (clientUrl.endsWith('/')) clientUrl = clientUrl.slice(0, -1);

        const session = await client.checkoutSessions.create({
            product_cart: [{
                product_id: product.product_id,
                quantity: 1
            }],
            billing_address: {
                country: 'IN',
                city: 'Bangalore',
                state: 'Karnataka',
                street: '123 Food Street',
                zipcode: '560001'
            },
            customer: {
                name: user?.name || 'Guest',
                email: user?.email || 'guest@example.com'
            },
            // Point to the Success Page with Order ID
            return_url: `${clientUrl}/payment-success?order_id=${newOrderId}`
        });

        console.log(`Payment Session Created: ${session.session_id}`);

        // 4. Save Order to Database (Supabase)
        const orderPayload = {
            id: newOrderId,
            user_id: user?._id || null, // Map frontend _id (which might be UUID now if user migrated)
            guest_info: {
                name: user?.name || 'Guest',
                email: user?.email || 'guest@example.com'
            },
            total_amount: amount,
            currency: currency,
            payment_id: session.session_id,
            payment_link: session.checkout_url,
            payment_status: 'Pending',
            order_status: 'Placed'
        };

        const { error: orderError } = await supabase
            .from('orders')
            .insert(orderPayload);

        if (orderError) throw orderError;

        // Insert Order Items if cart exists
        console.log("Processing Cart for Order Items:", JSON.stringify(cart, null, 2));

        if (cart && cart.length > 0) {
            const itemsToInsert = cart.map(item => {
                let foodId = item.foodId || item._id || item.id;

                // Validate UUID format (Simple regex check)
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(foodId);

                if (!isUUID) {
                    console.warn(`[Payment] Item ID '${foodId}' is not a valid UUID. Setting food_id to NULL.`);
                    foodId = null;
                }

                console.log(`Mapping Item: ${item.name}, Final ID: ${foodId}`);

                return {
                    order_id: newOrderId,
                    food_id: foodId, // now safe (UUID or null)
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                };
            });

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) {
                console.error('FAILED TO INSERT ORDER ITEMS:', itemsError);
            } else {
                console.log(`Successfully inserted ${itemsToInsert.length} items for order ${newOrderId}`);
            }
        } else {
            console.warn("Cart is empty or undefined, skipping item insertion.");
        }

        console.log(`Order saved with ID: ${newOrderId}`);

        // 5. Clear Cart (If user exists)
        if (user?._id) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user._id);
        }

        res.status(200).json({
            payment_link: session.checkout_url,
            session_id: session.session_id,
            order_id: newOrderId
        });

    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: 'Payment initiation failed', error: error.message });
    }
};
