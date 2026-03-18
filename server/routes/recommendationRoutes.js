const express = require('express');
const expressRouter = express.Router();
const recommendationController = require('../recommendation/recommendationController');

// Native Recommendation REST APIs
expressRouter.get('/:userId', recommendationController.getPersonalizedRecommendations);
expressRouter.get('/location/:userId/:location', recommendationController.getLocationAwareRecommendations);
expressRouter.get('/similar/:foodId', recommendationController.getSimilarFoods);
expressRouter.get('/trending/global', recommendationController.getTrending);
expressRouter.get('/explore/:userId', recommendationController.getExploreSelection);

// Activity Tracking API
expressRouter.post('/track', recommendationController.trackUserActivity);

module.exports = expressRouter;
