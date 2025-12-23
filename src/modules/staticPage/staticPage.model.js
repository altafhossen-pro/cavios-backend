const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true, // HTML content from TinyMCE
    },
    pageType: {
        type: String,
        enum: ['shipping', 'return-refund', 'privacy-policy', 'terms-conditions', 'faqs', 'other'],
        default: 'other'
    },
    isActive: {
        type: Boolean,
        default: true
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
staticPageSchema.index({ slug: 1 });
staticPageSchema.index({ pageType: 1 });
staticPageSchema.index({ isActive: 1 });

const StaticPage = mongoose.model('StaticPage', staticPageSchema);

module.exports = { StaticPage };

