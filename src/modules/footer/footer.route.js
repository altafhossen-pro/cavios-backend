const express = require('express');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');
const footerController = require('./footer.controller');
const router = express.Router();

// Public route for fetching footer config
router.get('/', footerController.getFooterConfig);

// Admin routes for managing footer config
router.get('/admin', verifyTokenAdmin, footerController.getFooterConfigAdmin);
router.put('/admin', verifyTokenAdmin, footerController.updateFooterConfig);

module.exports = router;
