const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Purchase routes
router.post('/', purchaseController.createPurchase);
router.post('/bulk', purchaseController.createBulkPurchases);
router.get('/', purchaseController.getUserPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.put('/:id/cancel', purchaseController.cancelPurchase);

module.exports = router; 