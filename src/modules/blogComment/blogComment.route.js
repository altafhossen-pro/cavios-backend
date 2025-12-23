const express = require('express');
const router = express.Router();
const {
    getBlogComments,
    getAllComments,
    createComment,
    toggleCommentApproval,
    deleteComment,
} = require('./blogComment.controller');
const verifyToken = require('../../middlewares/verifyToken');
const verifyTokenAdmin = require('../../middlewares/verifyTokenAdmin');

// Public routes
router.get('/blog/:blogId', getBlogComments);
router.post('/', createComment);

// Admin routes (protected)
router.get('/', verifyTokenAdmin, getAllComments);
router.patch('/:id/toggle-approval', verifyTokenAdmin, toggleCommentApproval);
router.delete('/:id', verifyTokenAdmin, deleteComment);

module.exports = router;

