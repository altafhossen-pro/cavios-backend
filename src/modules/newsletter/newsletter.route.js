const express = require('express');
const newsletterController = require('./newsletter.controller');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');
const router = express.Router();

// --- Public Routes ---
// Subscribe to newsletter
router.post('/subscribe', newsletterController.subscribe);
// Get newsletter settings
router.get('/settings', newsletterController.getSettings);

// --- Admin Routes ---
router.get('/subscribers', verifyTokenAdmin, newsletterController.getSubscribers);
router.delete('/subscribers/:id', verifyTokenAdmin, newsletterController.deleteSubscriber);
router.get('/subscribers/export', verifyTokenAdmin, newsletterController.exportSubscribers);
router.put('/settings', verifyTokenAdmin, newsletterController.updateSettings);

module.exports = router;
