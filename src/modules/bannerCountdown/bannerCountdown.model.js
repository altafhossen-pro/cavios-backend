const mongoose = require('mongoose');

const bannerCountdownSchema = new mongoose.Schema({
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
        default: '/shop-default-grid',
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    endDate: {
        type: Date,
        required: true
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
bannerCountdownSchema.index({ order: 1, isActive: 1 });
bannerCountdownSchema.index({ endDate: 1 });

const BannerCountdown = mongoose.model('BannerCountdown', bannerCountdownSchema);

module.exports = { BannerCountdown };

