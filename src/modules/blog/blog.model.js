const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true, // HTML content from TinyMCE
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        default: 'Admin',
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
}, {
    timestamps: true,
});

// Index for searching and sorting
blogSchema.index({ title: 'text', description: 'text' });
blogSchema.index({ isActive: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = { Blog };

