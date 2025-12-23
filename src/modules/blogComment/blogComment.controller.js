const { BlogComment } = require('./blogComment.model');
const sendResponse = require('../../utils/sendResponse');

// Get all comments for a blog (public route - only approved comments)
const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.params;
        
        const comments = await BlogComment.find({ 
            blogId, 
            isApproved: true,
            parentId: null // Only top-level comments
        })
        .sort({ createdAt: -1 })
        .lean();

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await BlogComment.find({
                    parentId: comment._id,
                    isApproved: true,
                })
                .sort({ createdAt: 1 })
                .lean();
                
                return {
                    ...comment,
                    replies,
                };
            })
        );

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Comments retrieved successfully',
            data: { comments: commentsWithReplies }
        });
    } catch (error) {
        console.error('Error getting blog comments:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get all comments (admin route - all comments including unapproved)
const getAllComments = async (req, res) => {
    try {
        const { blogId, page = 1, limit = 50, isApproved } = req.query;
        
        const query = {};
        if (blogId) {
            query.blogId = blogId;
        }
        if (isApproved !== undefined) {
            query.isApproved = isApproved === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const comments = await BlogComment.find(query)
            .populate('blogId', 'title slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await BlogComment.countDocuments(query);

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Comments retrieved successfully',
            data: {
                comments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalItems: total,
                    itemsPerPage: parseInt(limit),
                }
            }
        });
    } catch (error) {
        console.error('Error getting all comments:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create a new comment
const createComment = async (req, res) => {
    try {
        const { blogId, name, email, comment, parentId } = req.body;

        if (!blogId || !name || !email || !comment) {
            return sendResponse({
                res,
                statusCode: 400,
                success: false,
                message: 'Blog ID, name, email, and comment are required'
            });
        }

        const newComment = new BlogComment({
            blogId,
            name,
            email,
            comment,
            parentId: parentId || null,
            isApproved: false, // New comments need approval
        });

        await newComment.save();

        return sendResponse({
            res,
            statusCode: 201,
            success: true,
            message: 'Comment submitted successfully. It will be visible after approval.',
            data: { comment: newComment }
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

// Approve/Disapprove comment (admin)
const toggleCommentApproval = async (req, res) => {
    try {
        const { id } = req.params;
        
        const comment = await BlogComment.findById(id);
        if (!comment) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Comment not found'
            });
        }

        comment.isApproved = !comment.isApproved;
        await comment.save();

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: `Comment ${comment.isApproved ? 'approved' : 'disapproved'} successfully`,
            data: { comment }
        });
    } catch (error) {
        console.error('Error toggling comment approval:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete comment (admin)
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete comment and all its replies
        const result = await BlogComment.deleteMany({
            $or: [
                { _id: id },
                { parentId: id }
            ]
        });

        if (result.deletedCount === 0) {
            return sendResponse({
                res,
                statusCode: 404,
                success: false,
                message: 'Comment not found'
            });
        }

        return sendResponse({
            res,
            statusCode: 200,
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return sendResponse({
            res,
            statusCode: 500,
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getBlogComments,
    getAllComments,
    createComment,
    toggleCommentApproval,
    deleteComment,
};

