const express = require('express');
const router = express.Router();
const productController = require('../controllers/listingController');

router.get('/', productController.getProducts);
router.post('/', ...productController.createProduct);
router.get('/:id', productController.getProductById);

module.exports = router;