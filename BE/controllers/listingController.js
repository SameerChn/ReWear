const Product = require('../models/Listing');
const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Public (for demo, no auth)
const createProduct = [
  upload.array('images', 10), // up to 10 images
  asyncHandler(async (req, res) => {
    const { title, description, price } = req.body;
    if (!title || !description || !price || !req.files || req.files.length === 0) {
      res.status(400);
      throw new Error('All fields and at least one image are required');
    }
    // Use a helper to handle upload_stream with Promises
    async function uploadToCloudinary(fileBuffer) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'rewear-products', timeout: 60000 }, // 60 sec timeout
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(fileBuffer); // triggers the upload
      });
    }
    const imageUrls = await Promise.all(req.files.map(file => uploadToCloudinary(file.buffer)));
    const product = new Product({ 
      title, 
      description, 
      price, 
      images: imageUrls
    });
    const created = await product.save();
    res.status(201).json(created);
  })
];

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};