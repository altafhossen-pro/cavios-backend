const express = require('express');
const router = express.Router();
const {
    getAllBannerCollections,
    getBannerCollectionById,
    createBannerCollection,
    updateBannerCollection,
    deleteBannerCollection,
    toggleBannerCollectionStatus,
    getActiveBannerCollections
} = require('./bannerCollection.controller');
const verifyToken = require('../../middlewares/verifyToken');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');

// Public routes
router.get('/active', getActiveBannerCollections);

// Admin routes (protected)
router.get('/', verifyTokenAdmin, getAllBannerCollections);
router.get('/:id', verifyToken, verifyTokenAdmin, getBannerCollectionById);
router.post('/', verifyToken, verifyTokenAdmin, createBannerCollection);
router.put('/:id', verifyToken, verifyTokenAdmin, updateBannerCollection);
router.delete('/:id', verifyToken, verifyTokenAdmin, deleteBannerCollection);
router.patch('/:id/toggle-status', verifyToken, verifyTokenAdmin, toggleBannerCollectionStatus);

module.exports = router;

