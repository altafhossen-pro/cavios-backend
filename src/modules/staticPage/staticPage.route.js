const express = require('express');
const router = express.Router();
const {
    getAllStaticPages,
    getStaticPageBySlug,
    getStaticPageById,
    createStaticPage,
    updateStaticPage,
    deleteStaticPage,
    checkSlugAvailability
} = require('./staticPage.controller');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');

// Public routes
router.get('/slug/:slug', getStaticPageBySlug);

// Admin routes
router.get('/', verifyTokenAdmin, getAllStaticPages);
router.get('/check-slug', verifyTokenAdmin, checkSlugAvailability);
router.get('/:id', verifyTokenAdmin, getStaticPageById);
router.post('/', verifyTokenAdmin, createStaticPage);
router.patch('/:id', verifyTokenAdmin, updateStaticPage);
router.delete('/:id', verifyTokenAdmin, deleteStaticPage);

module.exports = router;

