const express = require('express');
const router = express.Router();
const AIConversationController = require('../controllers/AIConversationController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, AIConversationController.getUserConversations);
router.post('/messages', authenticate, AIConversationController.saveMessage);
router.delete('/cleanup', AIConversationController.deleteOldConversations);

module.exports = router;