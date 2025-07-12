const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.get('/', listingController.getListings);
router.get('/:id', listingController.getListingById);
router.get('/user/:userId', listingController.getUserListings);
router.get('/my-listings', protect, listingController.getMyListings);
router.post('/', protect, listingController.createListing);
router.put('/:id', protect, listingController.updateListing);
router.delete('/:id', protect, listingController.deleteListing);

module.exports = router;