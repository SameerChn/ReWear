const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  let { username, email, password } = req.body;

  // Normalize: if username looks like email, use only email
  if ((username && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username))) {
    email = username.toLowerCase();
    username = undefined;
  }
  if (email) {
    email = email.toLowerCase();
  }

  console.log('�� Login attempt:', { 
    username, 
    email, 
    hasPassword: !!password,
    bodyKeys: Object.keys(req.body),
    fullBody: req.body
  }); // Debug log

  // Allow login with either username or email, but prioritize email if present
  let user;
  if (email) {
    user = await User.findOne({ email });
    console.log('🔍 Searching by email:', email, 'Found:', !!user); // Debug log
  } else if (username) {
    user = await User.findOne({ username });
    console.log('🔍 Searching by username:', username, 'Found:', !!user); // Debug log
  } else {
    console.log('❌ No username or email provided'); // Debug log
    res.status(400);
    throw new Error('Please provide username or email');
  }

  if (user) {
    console.log('✅ User found:', { username: user.username, email: user.email }); // Debug log
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Password validation:', isPasswordValid, 'for password:', password); // Debug log
    
    if (isPasswordValid) {
      console.log('✅ Login successful for:', user.username); // Debug log
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        avatar: user.avatar,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      console.log('❌ Invalid password for:', user.username, 'Attempted password:', password); // Debug log
      res.status(401);
      throw new Error('Invalid credentials');
    }
  } else {
    console.log('❌ User not found'); // Debug log
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  let { username, email, password } = req.body;

  // Always lowercase email for registration
  if (email) {
    email = email.toLowerCase();
  }

  const userExists = await User.findOne({ $or: [{ username }, { email }] });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Assign a unique avatar from randomuser.me lego set (1-10)
  const avatarNumber = Math.floor(Math.random() * 10) + 1;
  const avatar = `https://randomuser.me/api/portraits/lego/${avatarNumber}.jpg`;

  const user = await User.create({
    username,
    email,
    password,
    avatar,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      points: user.points,
      avatar: user.avatar,
      location: user.location,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email ? req.body.email.toLowerCase() : user.email;
    user.avatar = req.body.avatar || user.avatar;
    user.location = req.body.location || user.location;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      location: updatedUser.location,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
};