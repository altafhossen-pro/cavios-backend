const express = require('express');
const router = express.Router();
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');
const headerMenuController = require('./headerMenu.controller');

// Public route - get header menu configuration
router.get('/', headerMenuController.getHeaderMenuConfig);

// Admin routes - get full config, update config
router.get('/admin', verifyTokenAdmin, headerMenuController.getHeaderMenuConfigAdmin);
router.put('/admin', verifyTokenAdmin, headerMenuController.updateHeaderMenuConfig);
router.put('/admin/order', verifyTokenAdmin, headerMenuController.updateMenuOrder);

module.exports = router;
