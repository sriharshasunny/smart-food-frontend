const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// 1. Admin: Create Restaurant
router.post('/create', async (req, res) => {
    try {
        const { name, email, address, cuisine } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and Email are required." });
        }

        // Check exists
        const { data: existing } = await supabase
            .from('restaurants')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return res.status(400).json({ message: "Restaurant already registered." });
        }

        // Create with Password = Email (Student Demo Request)
        const { data: newRest, error } = await supabase
            .from('restaurants')
            .insert({
                name,
                email,
                password: email, // ID and Pass are same
                address,
                cuisine: typeof cuisine === 'string' ? cuisine.split(',').map(c => c.trim()) : cuisine,
                rating: 0,
                image: ''
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: "Restaurant created successfully!",
            restaurant: { ...newRest, _id: newRest.id }
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

// 4. ADMIN: Get All Restaurants
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

// 5. ADMIN: Toggle Active Status
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

module.exports = router;
