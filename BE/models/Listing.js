const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["men's", "women's", 'kids', 'accessories'],
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'],
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like new', 'good', 'fair'],
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  badges: [
    {
      type: String,
      enum: ['trending', 'popular', 'new'],
    },
  ],
});

listingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);