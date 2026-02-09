const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// 1. Admin: Create Restaurant
router.post('/create', async (req, res) => {
    try {
        const { name, email, address, cuisine } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required." });
        }

        // Auto-generate email/credentials if not provided
        // Logic: specific email > name@gmail.com
        let finalEmail = email;
        if (!finalEmail) {
            const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            finalEmail = `${cleanName}@gmail.com`;
        }

        // Simple Password Generation (Same as Email for now, or 'password123')
        const password = finalEmail;

        // Check exists
        const { data: existing } = await supabase
            .from('restaurants')
            .select('id')
            .eq('email', finalEmail)
            .single();

        if (existing) {
            return res.status(400).json({ message: `Restaurant with email ${finalEmail} already exists.` });
        }

        // Create
        const { data: newRest, error } = await supabase
            .from('restaurants')
            .insert({
                name,
                email: finalEmail,
                password: password,
                address: address || '123 Food Street',
                cuisine: typeof cuisine === 'string' ? cuisine.split(',').map(c => c.trim()) : (cuisine || ['Multi-Cuisine']),
                rating: 0,
                image: '', // Placeholder can be set on frontend or default here
                is_active: true // Default Active
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: "Restaurant created successfully!",
            restaurant: { ...newRest, _id: newRest.id },
            credentials: { email: finalEmail, password: password }
        });

    } catch (error) {
        console.error("Rest Create Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 2. Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !restaurant || restaurant.password !== password) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        if (restaurant.is_active === false) {
            return res.status(403).json({ message: "Account suspended. Contact Admin." });
        }

        res.json({
            message: "Login successful",
            restaurant: { ...restaurant, _id: restaurant.id }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// 3. Get Dashboard Stats
router.get('/:id/dashboard', async (req, res) => {
    try {
        const { id } = req.params;

        // Verify restaurant exists
        const { data: rest } = await supabase.from('restaurants').select('name').eq('id', id).single();
        if (!rest) return res.status(404).json({ message: "Restaurant not found" });

        // Get Food Count
        const { count: foodCount } = await supabase
            .from('foods')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', id);

        res.json({
            name: rest.name,
            totalItems: foodCount || 0,
            activeOrders: 0, // Placeholder for future
            revenue: 0 // Placeholder
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard", error: error.message });
    }
});

// 4. ADMIN: Get All Restaurants (Include Suspended)
router.get('/all/list', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching restaurants", error: error.message });
    }
});

// 5. PUBLIC: Get Active Restaurants Only
router.get('/active/list', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching restaurants", error: error.message });
    }
});

// 6. PUBLIC: Get Single Restaurant Details (For RestaurantDetails Page)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        // Optional: Check is_active? Maybe allow viewing if direct link but show warning?
        // Ideally should block if suspended, but let's allow fetching and let frontend decide handling.

        res.json(restaurant);

    } catch (error) {
        res.status(500).json({ message: "Error fetching details", error: error.message });
    }
});

// 7. ADMIN: Toggle Active Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { is_active } = req.body;
        const { data, error } = await supabase
            .from('restaurants')
            .update({ is_active })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
});

// 8. ADMIN: Delete Restaurant
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Delete restaurant (Cascades to foods automatically due to schema)
        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: "Restaurant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting restaurant", error: error.message });
    }
});

module.exports = router;
