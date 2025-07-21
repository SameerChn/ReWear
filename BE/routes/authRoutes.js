const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const generateToken = require('../utils/generateToken');

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.get('/profile', protect, authController.getUserProfile);
router.put('/profile', protect, authController.updateUserProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login.html', session: true }), (req, res) => {
  // Generate JWT and redirect to frontend
  const token = generateToken(req.user._id);
  // You can change the redirect URL as needed
  res.redirect(`http://localhost:5500/index.html?token=${token}`);
});

module.exports = router;