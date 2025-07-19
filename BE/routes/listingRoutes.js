const express = require('express');
const router = express.Router();
const productController = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.post('/', protect, productController.createProduct);
router.get('/:id', productController.getProductById);

module.exports = router;