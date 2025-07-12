const Listing = require('../models/Listing');
const asyncHandler = require('express-async-handler');

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const {
    category,
    size,
    condition,
    status,
    search,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (size) query.size = size;
  if (condition) query.condition = condition;
  if (status) query.status = status;

  if (search) {
    query.$text = { $search: search };
  }

  const sortOptions = {};
  if (sort) {
    if (sort === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sort === 'price-low') {
      sortOptions.points = 1;
    } else if (sort === 'price-high') {
      sortOptions.points = -1;
    } else if (sort === 'popular') {
      // This would need additional logic for popularity
      sortOptions.views = -1;
    }
  } else {
    sortOptions.createdAt = -1;
  }

  const listings = await Listing.find(query)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('owner', 'username avatar rating');

  const count = await Listing.countDocuments(query);

  res.json({
    listings,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  });
});

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate(
    'owner',
    'username avatar rating swapsCompleted'
  );

  if (listing) {
    res.json(listing);
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
const createListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    size,
    condition,
    points,
    images,
    badges,
  } = req.body;

  const listing = new Listing({
    title,
    description,
    category,
    size,
    condition,
    points,
    images,
    badges,
    owner: req.user._id,
  });

  const createdListing = await listing.save();
  res.status(201).json(createdListing);
});

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (listing) {
    // Check if the user is the owner of the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this listing');
    }

    listing.title = req.body.title || listing.title;
    listing.description = req.body.description || listing.description;
    listing.category = req.body.category || listing.category;
    listing.size = req.body.size || listing.size;
    listing.condition = req.body.condition || listing.condition;
    listing.points = req.body.points || listing.points;
    listing.images = req.body.images || listing.images;
    listing.badges = req.body.badges || listing.badges;
    listing.status = req.body.status || listing.status;
    listing.updatedAt = Date.now();

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (listing) {
    // Check if the user is the owner of the listing
    if (listing.owner.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this listing');
    }

    await listing.remove();
    res.json({ message: 'Listing removed' });
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Get user's listings
// @route   GET /api/listings/user/:userId
// @access  Public
const getUserListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.params.userId }).populate(
    'owner',
    'username avatar'
  );
  res.json(listings);
});

// @desc    Get current user's listings
// @route   GET /api/listings/my-listings
// @access  Private
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.json(listings);
});

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getUserListings,
  getMyListings,
};