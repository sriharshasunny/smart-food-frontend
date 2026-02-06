const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/ask', chatController.askChatbot);

module.exports = router;
