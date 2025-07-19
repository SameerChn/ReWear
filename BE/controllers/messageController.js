const Message = require('../models/Message');
const asyncHandler = require('express-async-handler');

// @desc    Get user's messages
// @route   GET /api/messages
// @access  Private
const getUserMessages = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.find({ recipient: userId })
    .populate('sender', 'username avatar')
    .populate('relatedProduct', 'title images')
    .sort({ createdAt: -1 });

  res.json(messages);
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if user owns this message
  if (message.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to mark this message as read');
  }

  message.isRead = true;
  const updatedMessage = await message.save();

  res.json(updatedMessage);
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const count = await Message.countDocuments({
    recipient: userId,
    isRead: false,
  });

  res.json({ unreadCount: count });
});

// @desc    Create a message (internal function)
// @access  Private
const createMessage = async (senderId, recipientId, subject, content, relatedPurchase = null, relatedProduct = null) => {
  const message = new Message({
    sender: senderId,
    recipient: recipientId,
    subject,
    content,
    relatedPurchase,
    relatedProduct,
  });

  return await message.save();
};

module.exports = {
  getUserMessages,
  markMessageAsRead,
  getUnreadCount,
  createMessage,
}; 