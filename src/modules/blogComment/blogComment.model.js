const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogComment',
        default: null, // null means it's a top-level comment
    },
    isApproved: {
        type: Boolean,
        default: false, // Comments need approval by default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Indexes for efficient queries
blogCommentSchema.index({ blogId: 1, isApproved: 1, createdAt: -1 });
blogCommentSchema.index({ parentId: 1 });

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

module.exports = { BlogComment };

