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
  // Generate JWT and redirect to the correct frontend with user info
  const token = generateToken(req.user._id);
  const userData = {
    _id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    points: req.user.points,
    avatar: req.user.avatar,
    location: req.user.location
  };
  const frontendUrl = process.env.NODE_ENV === 'production'
    ? 'https://rewear-beta.vercel.app/index.html'
    : 'http://localhost:5500/docs/index.html';
  res.redirect(`${frontendUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
});

module.exports = router;