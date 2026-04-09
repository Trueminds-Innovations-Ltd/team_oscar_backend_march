const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/ConversationController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, ConversationController.getConversations);
router.get('/:id', authenticate, ConversationController.getConversation);
router.post('/:id/messages', authenticate, ConversationController.sendMessage);

module.exports = router;