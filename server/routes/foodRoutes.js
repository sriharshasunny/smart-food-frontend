const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');

// 1. PUBLIC: Get All Foods (For Home Page)
router.get('/all', async (req, res) => {
    try {
        const { data: foods, error } = await supabase
            .from('foods')
            .select(`
                *,
                restaurant_id!inner (
                    name,
                    rating,
                    is_active
                )
            `)
            .eq('available', true)
            .eq('restaurant_id.is_active', true);

        if (error) throw error;

        // Transform for frontend (map snake_case to camelCase if needed, or keep consistent)
        // Frontend expects: id, name, price, image, restaurantId, rating...
        const formatted = foods.map(f => ({
            id: f.id,
            name: f.name,
            price: f.price,
            image: f.image,
            description: f.description,
            category: f.category,
            isVeg: f.is_veg,
            rating: 4.5, // Default/Mock or fetch from reviews
            restaurantId: f.restaurant_id?.id || f.restaurant_id, // depends on join
            restaurantName: f.restaurant_id?.name || "Unknown Rest"
        }));

        res.json(formatted);
    } catch (error) {
        console.error("Get Foods Error:", error);
        res.status(500).json({ message: "Error fetching foods" });
    }
});

// 2. PRIVATE: Get Restaurant Menu
router.get('/restaurant/:id', async (req, res) => {
    try {
        const { data: foods, error } = await supabase
            .from('foods')
            .select('*')
            .eq('restaurant_id', req.params.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: "Error fetching menu", error: error.message });
    }
});

// 3. PRIVATE: Add Food Item
router.post('/add', async (req, res) => {
    try {
        const { restaurantId, name, price, description, category, image, isVeg } = req.body;

        if (!restaurantId || !name || !price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { data: newItem, error } = await supabase
            .from('foods')
            .insert({
                restaurant_id: restaurantId,
                name,
                price,
                description,
                category,
                image,
                is_veg: isVeg,
                available: true
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(newItem);

    } catch (error) {
        console.error("Add Food Error:", error);
        res.status(500).json({ message: "Error adding food", error: error.message });
    }
});

// 4. PRIVATE: Update Food
router.put('/:id', async (req, res) => {
    try {
        const { name, price, description, category, image, isVeg, available } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (price) updates.price = price;
        if (description) updates.description = description;
        if (category) updates.category = category;
        if (image) updates.image = image;
        if (isVeg !== undefined) updates.is_veg = isVeg;
        if (available !== undefined) updates.available = available;

        const { data: updated, error } = await supabase
            .from('foods')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: "Error updating food", error: error.message });
    }
});

// 6. PRIVATE: Toggle Availability
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { available } = req.body;
        const { data: updated, error } = await supabase
            .from('foods')
            .update({ available })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error toggling availability", error: error.message });
    }
});

// 5. PRIVATE: Delete Food
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('foods')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: "Food deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting food", error: error.message });
    }
});

module.exports = router;
