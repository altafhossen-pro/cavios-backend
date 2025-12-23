const express = require('express');
const router = express.Router();
const {
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleBlogStatus,
    getLatestBlogs,
    checkSlugAvailability
} = require('./blog.controller');
const verifyToken = require('../../middlewares/verifyToken');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');

// Public routes
router.get('/latest', getLatestBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/check-slug', checkSlugAvailability); // Public route for slug validation

// Admin routes (protected)
router.get('/', verifyTokenAdmin, getAllBlogs);
router.get('/:id', verifyTokenAdmin, getBlogById);
router.post('/', verifyToken, verifyTokenAdmin, createBlog);
router.patch('/:id', verifyToken, verifyTokenAdmin, updateBlog);
router.delete('/:id', verifyToken, verifyTokenAdmin, deleteBlog);
router.patch('/:id/toggle-status', verifyToken, verifyTokenAdmin, toggleBlogStatus);

module.exports = router;

