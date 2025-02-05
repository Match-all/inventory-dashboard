const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get user's products
router.get('/:userId/products', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add product to user
router.post('/:userId/products', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const products = JSON.parse(user.products || '[]');
        products.push({
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        });

        const updatedUser = await User.updateUser(user.id, {
            products: JSON.stringify(products)
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 