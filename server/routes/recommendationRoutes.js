const express = require('express');
const expressRouter = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Native Recommendation REST APIs
expressRouter.get('/:userId', recommendationController.getPersonalizedRecommendations);
expressRouter.get('/location/:userId/:location', recommendationController.getLocationBasedRecommendations);
expressRouter.get('/similar/:foodId', recommendationController.getSimilarFoodRecommendations);
expressRouter.get('/ufo-message/:userId', recommendationController.getUFOMessage);

// Activity Tracking API
expressRouter.post('/track', recommendationController.trackUserActivity);

module.exports = expressRouter;
