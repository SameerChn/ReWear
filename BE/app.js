require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/listingRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
connectDB();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Google OAuth session and passport setup
const session = require('express-session');
const passport = require('passport');
require('./config/passport');
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/messages', messageRoutes);
app.use(errorHandler);
module.exports = app;