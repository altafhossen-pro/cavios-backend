const express = require('express');
const router = express.Router();
const {
    getAllBannerCountdowns,
    getBannerCountdownById,
    createBannerCountdown,
    updateBannerCountdown,
    deleteBannerCountdown,
    toggleBannerCountdownStatus,
    getActiveBannerCountdown
} = require('./bannerCountdown.controller');
const verifyToken = require('../../middlewares/verifyToken');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');

// Public routes
router.get('/active', getActiveBannerCountdown);

// Admin routes (protected)
router.get('/', verifyTokenAdmin, getAllBannerCountdowns);
router.get('/:id', verifyToken, verifyTokenAdmin, getBannerCountdownById);
router.post('/', verifyToken, verifyTokenAdmin, createBannerCountdown);
router.put('/:id', verifyToken, verifyTokenAdmin, updateBannerCountdown);
router.delete('/:id', verifyToken, verifyTokenAdmin, deleteBannerCountdown);
router.patch('/:id/toggle-status', verifyToken, verifyTokenAdmin, toggleBannerCountdownStatus);

module.exports = router;

