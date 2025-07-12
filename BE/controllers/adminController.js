const Admin = require('../models/Admin');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Swap = require('../models/Swap');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });

  if (admin && (await admin.comparePassword(password))) {
    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id, true),
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
});

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalListings = await Listing.countDocuments();
  const activeListings = await Listing.countDocuments({ status: 'available' });
  const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
  const completedSwaps = await Swap.countDocuments({ status: 'completed' });

  res.json({
    totalUsers,
    totalListings,
    activeListings,
    pendingSwaps,
    completedSwaps,
  });
});

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private/Admin
const getRecentActivity = asyncHandler(async (req, res) => {
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('username email createdAt');

  const recentListings = await Listing.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('owner', 'username')
    .select('title points status createdAt');

  const recentSwaps = await Swap.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('requester recipient', 'username')
    .populate('listing', 'title points');

  res.json({
    recentUsers,
    recentListings,
    recentSwaps,
  });
});

module.exports = {
  adminLogin,
  getAdminStats,
  getRecentActivity,
};