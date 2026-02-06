const supabase = require('../utils/supabase');

// Add/Remove item from wishlist
exports.toggleWishlist = async (req, res) => {
    try {
        const { userId, foodId } = req.body;

        // Check if item exists in wishlist
        const { data: existing, error: fetchError } = await supabase
            .from('wishlist_items')
            .select('id')
            .eq('user_id', userId)
            .eq('food_id', foodId)
            .single();

        if (existing) {
            // Remove
            const { error: deleteError } = await supabase
                .from('wishlist_items')
                .delete()
                .eq('id', existing.id);

            if (deleteError) throw deleteError;
        } else {
            // Add
            const { error: insertError } = await supabase
                .from('wishlist_items')
                .insert({ user_id: userId, food_id: foodId });

            if (insertError) throw insertError;
        }

        // Return updated wishlist
        const { data: wishlist, error: listError } = await supabase
            .from('wishlist_items')
            .select('food_id')
            .eq('user_id', userId);

        if (listError) throw listError;

        res.status(200).json({ wishlist });
    } catch (error) {
        console.error('Wishlist Error:', error);
        res.status(500).json({ message: 'Error updating wishlist', error: error.message });
    }
};

// Sync entire cart
exports.syncCart = async (req, res) => {
    try {
        const { userId, cart } = req.body;

        // 1. Clear existing cart for user (Simple sync strategy)
        // A better strategy might be merging, but "Sync" implies "Make it look like this"
        const { error: clearError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (clearError) throw clearError;

        if (cart && cart.length > 0) {
            // 2. Insert new items with UUID Validation
            const itemsToInsert = cart.map(item => {
                let foodId = item.foodId || item._id || item.id;
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(foodId);
                if (!isUUID) foodId = null;

                return {
                    user_id: userId,
                    food_id: foodId,
                    quantity: item.quantity,
                    notes: item.notes
                };
            });

            const { error: insertError } = await supabase
                .from('cart_items')
                .insert(itemsToInsert);

            if (insertError) throw insertError;
        }

        // 3. Fetch updated cart with details
        const { data: newCart, error: fetchError } = await supabase
            .from('cart_items')
            .select(`
                quantity, 
                notes, 
                food_items ( * )
            `)
            .eq('user_id', userId);

        if (fetchError) throw fetchError;

        // Flatten structure to match frontend expectation if needed, or frontend adapts
        // Supabase returns { quantity, food_items: { ... } }
        // Frontend likely expects { quantity, foodId: { ... } } or similar.
        // Let's map it to resemble Mongoose populate
        const formattedCart = newCart.map(item => ({
            quantity: item.quantity,
            notes: item.notes,
            foodId: item.food_items // Rename for compatibility
        }));

        res.status(200).json({ cart: formattedCart });
    } catch (error) {
        console.error('Cart Sync Error:', error);
        res.status(500).json({ message: 'Error syncing cart', error: error.message });
    }
};

// Get User Data
exports.getUserData = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Get User Profile
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError || !user) return res.status(404).json({ message: 'User not found' });

        // 2. Get Addresses
        const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId);

        user.addresses = addresses || [];

        // 3. Get Wishlist (populated)
        const { data: wishlistData } = await supabase
            .from('wishlist_items')
            .select('added_at, food_items ( * )')
            .eq('user_id', userId);

        user.wishlist = (wishlistData || []).map(w => ({
            addedAt: w.added_at,
            foodId: w.food_items
        }));

        // 4. Get Cart (populated)
        const { data: cartData } = await supabase
            .from('cart_items')
            .select('quantity, notes, food_items ( * )')
            .eq('user_id', userId);

        user.cart = (cartData || []).map(c => ({
            quantity: c.quantity,
            notes: c.notes,
            foodId: c.food_items
        }));

        // 5. Get Orders
        // Order by created_at desc
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        user.orders = orders || [];

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get User Data Error:', error);
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, phone, address, password } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        // Password handling skipped for now (Supabase Auth handles this better, or store hash)

        // 1. Update User Table
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (updateError) throw updateError;

        // 2. Handle Address Update
        let displayAddress = '';
        if (address) {
            // Check for existing default/Home address
            const { data: existingAddr } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', userId)
                .or('label.eq.Home,is_default.eq.true')
                .limit(1)
                .single();

            if (existingAddr) {
                // Update
                await supabase
                    .from('addresses')
                    .update({ street: address })
                    .eq('id', existingAddr.id);
                displayAddress = address;
            } else {
                // Insert
                await supabase
                    .from('addresses')
                    .insert({
                        user_id: userId,
                        label: 'Home',
                        street: address,
                        is_default: true
                    });
                displayAddress = address;
            }
        } else {
            // Fetch existing for return
            const { data: existingAddr } = await supabase
                .from('addresses')
                .select('street')
                .eq('user_id', userId)
                .is('is_default', true)
                .limit(1)
                .single();
            displayAddress = existingAddr?.street || '';
        }

        res.status(200).json({
            message: 'Profile updated',
            user: {
                _id: updatedUser.id, // Keep _id for frontend compatibility
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: displayAddress
            }
        });
    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ message: 'Error updating specific profile fields', error: error.message });
    }
};

exports.updateUserProfileByEmail = async (req, res) => {
    try {
        const { email, name, phone, address } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required for update' });
        }

        // 1. Find User by Email
        const { data: user, error: findError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (findError || !user) return res.status(404).json({ message: 'User not found' });

        // 2. Delegate to generic update using ID
        req.params.userId = user.id;
        return exports.updateUserProfile(req, res);

    } catch (error) {
        console.error('Profile Update By Email Error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};
