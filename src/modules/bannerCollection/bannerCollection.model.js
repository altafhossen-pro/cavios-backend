const mongoose = require('mongoose');

const bannerCollectionSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    buttonText: {
        type: String,
        default: 'Shop Now',
        trim: true
    },
    buttonLink: {
        type: String,
        default: '/shop-collection',
        trim: true
    },
    style: {
        type: String,
        enum: ['default', 'position'],
        default: 'default'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for ordering and active status
bannerCollectionSchema.index({ order: 1, isActive: 1 });

const BannerCollection = mongoose.model('BannerCollection', bannerCollectionSchema);

module.exports = { BannerCollection };

