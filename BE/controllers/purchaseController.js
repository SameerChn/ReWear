const Purchase = require('../models/Purchase');
const Product = require('../models/Listing');
const User = require('../models/User');
const { createMessage } = require('./messageController');
const asyncHandler = require('express-async-handler');

// @desc    Create a new purchase
// @route   POST /api/purchases
// @access  Private
const createPurchase = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, shippingAddress } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required');
  }

  // Get product details
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Calculate total amount
  const totalAmount = product.price * quantity;

  // Create purchase
  const purchase = new Purchase({
    user: userId,
    product: productId,
    seller: product.seller || product.user || userId, // Handle products without seller info
    quantity,
    totalAmount,
    paymentMethod: 'cash', // Default to cash payment
    shippingAddress,
    status: 'completed', // Auto-complete for demo
    completedAt: new Date(),
  });

  const createdPurchase = await purchase.save();

      // Send message to seller (only if seller exists and is different from buyer)
    const sellerId = product.seller || product.user || userId;
    if (sellerId.toString() !== userId.toString()) {
      await createMessage(
        userId,
        sellerId,
        'Item Purchased',
        `Your item "${product.title}" has been purchased by ${user.username} for $${product.price}.`,
        createdPurchase._id,
        product._id
      );
    }

  // Populate product and user details for response
  await createdPurchase.populate('product');
  await createdPurchase.populate('user', 'username email');
  await createdPurchase.populate('seller', 'username');

  res.status(201).json({
    ...createdPurchase.toObject(),
    user: {
      _id: createdPurchase.user._id,
      username: createdPurchase.user.username,
      email: createdPurchase.user.email,
    },
  });
});

// @desc    Get user's purchase history
// @route   GET /api/purchases
// @access  Private
const getUserPurchases = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const purchases = await Purchase.find({ user: userId })
    .populate('product')
    .sort({ createdAt: -1 });

  res.json(purchases);
});

// @desc    Get purchase by ID
// @route   GET /api/purchases/:id
// @access  Private
const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('product')
    .populate('user', 'username email');

  if (!purchase) {
    res.status(404);
    throw new Error('Purchase not found');
  }

  // Check if user owns this purchase
  if (purchase.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this purchase');
  }

  res.json(purchase);
});

// @desc    Cancel a purchase
// @route   PUT /api/purchases/:id/cancel
// @access  Private
const cancelPurchase = asyncHandler(async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    res.status(404);
    throw new Error('Purchase not found');
  }

  // Check if user owns this purchase
  if (purchase.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this purchase');
  }

  if (purchase.status !== 'pending') {
    res.status(400);
    throw new Error('Can only cancel pending purchases');
  }

  purchase.status = 'cancelled';
  const updatedPurchase = await purchase.save();

  res.json(updatedPurchase);
});

// @desc    Create bulk purchases from cart
// @route   POST /api/purchases/bulk
// @access  Private
const createBulkPurchases = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  const userId = req.user._id;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400);
    throw new Error('Product IDs array is required');
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get all products
  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length !== productIds.length) {
    res.status(404);
    throw new Error('Some products not found');
  }

  // Calculate total amount
  const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

  // Create purchases and send messages
  const purchases = [];
  const messages = [];

  for (const product of products) {
    // Create purchase
    const purchase = new Purchase({
      user: userId,
      product: product._id,
      seller: product.seller || product.user || userId,
      quantity: 1,
      totalAmount: product.price,
      paymentMethod: 'cash',
      status: 'completed',
      completedAt: new Date(),
    });

    const createdPurchase = await purchase.save();
    purchases.push(createdPurchase);

    // Send message to seller (only if seller exists and is different from buyer)
    const sellerId = product.seller || product.user || userId;
    if (sellerId.toString() !== userId.toString()) {
      const message = await createMessage(
        userId,
        sellerId,
        'Item Purchased',
        `Your item "${product.title}" has been purchased by ${user.username} for $${product.price}.`,
        createdPurchase._id,
        product._id
      );
      messages.push(message);
    }
  }

  // Populate purchase details for response
  await Promise.all(purchases.map(async (purchase) => {
    await purchase.populate('product');
    await purchase.populate('seller', 'username');
  }));

  res.status(201).json({
    purchases,
    messages: messages.length,
    totalAmount,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

module.exports = {
  createPurchase,
  createBulkPurchases,
  getUserPurchases,
  getPurchaseById,
  cancelPurchase,
}; 