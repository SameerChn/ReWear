const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, swapController.getSwaps);
router.post('/', protect, swapController.createSwap);
router.put('/:id/accept', protect, swapController.acceptSwap);
router.put('/:id/reject', protect, swapController.rejectSwap);
router.put('/:id/cancel', protect, swapController.cancelSwap);
router.put('/:id/complete', protect, swapController.completeSwap);

module.exports = router;