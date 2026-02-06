const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders/verify - verify and confirm order
router.post('/verify', orderController.verifyOrder);

// GET /api/orders/:id - get single order
router.get('/:id', orderController.getOrderById);

// GET /api/orders?userId=... - get history
router.get('/', orderController.getOrderHistory);

// DELETE /api/orders?userId=... - clear history
router.delete('/', orderController.deleteOrderHistory);

module.exports = router;
