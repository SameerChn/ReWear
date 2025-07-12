const Swap = require('../models/Swap');
const Listing = require('../models/Listing');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a swap request
// @route   POST /api/swaps
// @access  Private
const createSwap = asyncHandler(async (req, res) => {
  const { listingId, message } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.owner.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('Cannot request swap for your own listing');
  }

  if (listing.status !== 'available') {
    res.status(400);
    throw new Error('Listing is not available for swap');
  }

  // Check if user has enough points
  const user = await User.findById(req.user._id);
  if (user.points < listing.points) {
    res.status(400);
    throw new Error('Not enough points to request this swap');
  }

  // Check if there's already a pending swap for this listing and user
  const existingSwap = await Swap.findOne({
    listing: listingId,
    requester: req.user._id,
    status: 'pending',
  });

  if (existingSwap) {
    res.status(400);
    throw new Error('You already have a pending swap for this listing');
  }

  const swap = new Swap({
    requester: req.user._id,
    recipient: listing.owner,
    listing: listingId,
    message,
  });

  // Update listing status to pending
  listing.status = 'pending';
  await listing.save();

  const createdSwap = await swap.save();
  res.status(201).json(createdSwap);
});

// @desc    Get swaps for current user
// @route   GET /api/swaps
// @access  Private
const getSwaps = asyncHandler(async (req, res) => {
  const swaps = await Swap.find({
    $or: [{ requester: req.user._id }, { recipient: req.user._id }],
  })
    .populate('requester', 'username avatar')
    .populate('recipient', 'username avatar')
    .populate('listing', 'title points images');

  res.json(swaps);
});

// @desc    Accept a swap request
// @route   PUT /api/swaps/:id/accept
// @access  Private
const acceptSwap = asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id)
    .populate('listing')
    .populate('requester')
    .populate('recipient');

  if (!swap) {
    res.status(404);
    throw new Error('Swap not found');
  }

  // Check if the current user is the recipient
  if (swap.recipient._id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to accept this swap');
  }

  if (swap.status !== 'pending') {
    res.status(400);
    throw new Error('Swap is not in pending status');
  }

  // Check if requester still has enough points
  if (swap.requester.points < swap.listing.points) {
    res.status(400);
    throw new Error('Requester no longer has enough points for this swap');
  }

  // Transfer points
  swap.requester.points -= swap.listing.points;
  swap.recipient.points += swap.listing.points;

  await swap.requester.save();
  await swap.recipient.save();

  // Update swap status
  swap.status = 'accepted';
  swap.pointsTransferred = true;

  // Update listing status
  swap.listing.status = 'sold';
  await swap.listing.save();

  const updatedSwap = await swap.save();

  res.json(updatedSwap);
});

// @desc    Reject a swap request
// @route   PUT /api/swaps/:id/reject
// @access  Private
const rejectSwap = asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id).populate('listing');

  if (!swap) {
    res.status(404);
    throw new Error('Swap not found');
  }

  // Check if the current user is the recipient
  if (swap.recipient.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to reject this swap');
  }

  if (swap.status !== 'pending') {
    res.status(400);
    throw new Error('Swap is not in pending status');
  }

  // Update swap status
  swap.status = 'rejected';

  // Update listing status back to available
  swap.listing.status = 'available';
  await swap.listing.save();

  const updatedSwap = await swap.save();

  res.json(updatedSwap);
});

// @desc    Cancel a swap request
// @route   PUT /api/swaps/:id/cancel
// @access  Private
const cancelSwap = asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id).populate('listing');

  if (!swap) {
    res.status(404);
    throw new Error('Swap not found');
  }

  // Check if the current user is the requester
  if (swap.requester.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to cancel this swap');
  }

  if (swap.status !== 'pending') {
    res.status(400);
    throw new Error('Swap is not in pending status');
  }

  // Update swap status
  swap.status = 'cancelled';

  // Update listing status back to available
  swap.listing.status = 'available';
  await swap.listing.save();

  const updatedSwap = await swap.save();

  res.json(updatedSwap);
});

// @desc    Complete a swap (mark as received)
// @route   PUT /api/swaps/:id/complete
// @access  Private
const completeSwap = asyncHandler(async (req, res) => {
  const swap = await Swap.findById(req.params.id);

  if (!swap) {
    res.status(404);
    throw new Error('Swap not found');
  }

  // Check if the current user is the requester
  if (swap.requester.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to complete this swap');
  }

  if (swap.status !== 'accepted') {
    res.status(400);
    throw new Error('Swap must be accepted before completing');
  }

  // Update swap status
  swap.status = 'completed';
  const updatedSwap = await swap.save();

  // Update user stats
  await User.findByIdAndUpdate(swap.requester, { $inc: { swapsCompleted: 1 } });
  await User.findByIdAndUpdate(swap.recipient, { $inc: { swapsCompleted: 1 } });

  res.json(updatedSwap);
});

module.exports = {
  createSwap,
  getSwaps,
  acceptSwap,
  rejectSwap,
  cancelSwap,
  completeSwap,
};