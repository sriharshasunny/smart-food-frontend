const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/wishlist', userController.toggleWishlist);
router.post('/cart', userController.syncCart);
router.get('/:userId', userController.getUserData);
// Update user profile by ID
router.put('/profile/:userId', userController.updateUserProfile);

// Update user profile by Email (Direct update)
router.put('/profile-by-email', userController.updateUserProfileByEmail);

module.exports = router;
